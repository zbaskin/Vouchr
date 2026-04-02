#!/usr/bin/env node
/**
 * seed-tickets.mjs — bulk ticket seed script for Vouchr
 *
 * Usage:
 *   node scripts/seed-tickets.mjs \
 *     --collection <ticketCollectionId> \
 *     [--count <n>]       (default: 20) \
 *     [--delay <ms>]      (default: 200) \
 *     [--username <u>]    Cognito username (or set VOUCHR_USERNAME env var) \
 *     [--password <p>]    Cognito password (or set VOUCHR_PASSWORD env var)
 *
 * The script reads AppSync endpoint config from src/aws-exports.js (gitignored
 * locally). Authentication uses Cognito USER_SRP_AUTH to get a short-lived
 * JWT which is then passed as the Authorization header on every AppSync request.
 *
 * Because this is a thin CLI wrapper around the pure logic in seed-data.mjs,
 * it has no unit tests of its own.
 */

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession } from 'aws-amplify/auth';
import { generateTicket, buildMutation } from './seed-data.mjs';

// ---------------------------------------------------------------------------
// Resolve project root so we can load aws-exports.js regardless of cwd
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (raw.startsWith('--')) {
      const key = raw.slice(2);
      const val = argv[i + 1];
      if (val !== undefined && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const cliArgs = parseArgs(process.argv.slice(2));

const collectionId = cliArgs.collection;
const count        = parseInt(cliArgs.count  ?? '20', 10);
const delay        = parseInt(cliArgs.delay  ?? '200', 10);
const username     = cliArgs.username  ?? process.env.VOUCHR_USERNAME;
const password     = cliArgs.password  ?? process.env.VOUCHR_PASSWORD;

if (!collectionId) {
  console.error('Error: --collection <id> is required.');
  console.error('Usage: node scripts/seed-tickets.mjs --collection <id> [--count 20] [--delay 200]');
  process.exit(1);
}

if (!username || !password) {
  console.error('Error: Cognito credentials are required.');
  console.error('Pass --username and --password flags or set VOUCHR_USERNAME / VOUCHR_PASSWORD env vars.');
  process.exit(1);
}

if (isNaN(count) || count < 1) {
  console.error(`Error: --count must be a positive integer (got "${cliArgs.count}").`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load AppSync config from src/aws-exports.js and configure Amplify
// ---------------------------------------------------------------------------

let awsConfig;
try {
  const mod = await import(pathToFileURL(path.join(ROOT, 'src', 'aws-exports.js')).href);
  awsConfig = mod.default ?? mod;
} catch (err) {
  console.error('Error: could not load src/aws-exports.js.');
  console.error('Make sure the file exists (it is gitignored and must be present locally).');
  console.error(err.message);
  process.exit(1);
}

const APPSYNC_ENDPOINT = awsConfig.aws_appsync_graphqlEndpoint;

if (!APPSYNC_ENDPOINT) {
  console.error('Error: aws_appsync_graphqlEndpoint not found in src/aws-exports.js.');
  process.exit(1);
}

// Amplify v6 requires explicit config structure — aws-exports.js uses legacy v5 keys
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:       awsConfig.aws_user_pools_id,
      userPoolClientId: awsConfig.aws_user_pools_web_client_id,
      identityPoolId:   awsConfig.aws_cognito_identity_pool_id,
    },
  },
});

// ---------------------------------------------------------------------------
// Amplify SRP auth — obtain id token (no USER_PASSWORD_AUTH required)
// ---------------------------------------------------------------------------

// Returns { token, owner } where owner is the AppSync owner string ("sub::username")
async function authenticate(user, pass) {
  await signIn({ username: user, password: pass });
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken;
  const tokenStr = idToken?.toString();
  if (!tokenStr) {
    throw new Error('Auth succeeded but no idToken found in session.');
  }
  // Decode JWT payload (no signature verification needed — AppSync verifies it)
  const payload = JSON.parse(Buffer.from(tokenStr.split('.')[1], 'base64url').toString());
  const sub      = payload.sub;
  const cogUser  = payload['cognito:username'] ?? user;
  const owner    = `${sub}::${cogUser}`;
  return { token: tokenStr, owner };
}

// ---------------------------------------------------------------------------
// AppSync request helper
// ---------------------------------------------------------------------------

async function runMutation(token, mutationStr) {
  const res = await fetch(APPSYNC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ query: mutationStr }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  }

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }

  return json.data?.createTicket;
}

// ---------------------------------------------------------------------------
// sleep helper
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\nVouchr ticket seed script`);
console.log(`  Collection : ${collectionId}`);
console.log(`  Count      : ${count}`);
console.log(`  Delay      : ${delay}ms between requests`);
console.log(`  Endpoint   : ${APPSYNC_ENDPOINT}`);
console.log('');

// Authenticate first
process.stdout.write('Authenticating with Cognito... ');
let token, owner;
try {
  ({ token, owner } = await authenticate(username, password));
  console.log('OK');
} catch (err) {
  console.error(`FAILED\n${err.message}`);
  process.exit(1);
}

// Seed loop
let created = 0;
let failed  = 0;
const errors = [];

for (let i = 1; i <= count; i++) {
  const ticket   = generateTicket(collectionId, owner);
  const mutation = buildMutation(ticket);

  try {
    const result = await runMutation(token, mutation);
    const id = result?.id ?? '(no id)';
    console.log(`[${i}/${count}] Created "${ticket.name}" — id: ${id} ✓`);
    created++;
  } catch (err) {
    console.error(`[${i}/${count}] FAILED "${ticket.name}" — ${err.message}`);
    errors.push({ index: i, name: ticket.name, error: err.message });
    failed++;
  }

  if (i < count) {
    await sleep(delay);
  }
}

// Summary
console.log('');
console.log('─'.repeat(50));
console.log(`Seed complete.`);
console.log(`  Created : ${created}`);
if (failed > 0) {
  console.log(`  Failed  : ${failed}`);
  errors.forEach(({ index, name, error }) => {
    console.log(`    [${index}] "${name}": ${error}`);
  });
}
console.log('─'.repeat(50));

if (failed > 0) {
  process.exit(1);
}
