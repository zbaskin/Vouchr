#!/usr/bin/env node
/**
 * clear-tickets.mjs — delete all tickets from a given collection
 *
 * Usage:
 *   node scripts/clear-tickets.mjs \
 *     --collection <ticketCollectionId> \
 *     [--delay <ms>]      (default: 100) \
 *     [--username <u>]    Cognito username (or set VOUCHR_USERNAME env var) \
 *     [--password <p>]    Cognito password (or set VOUCHR_PASSWORD env var)
 */

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession } from 'aws-amplify/auth';

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
const delay        = parseInt(cliArgs.delay ?? '100', 10);
const username     = cliArgs.username ?? process.env.VOUCHR_USERNAME;
const password     = cliArgs.password ?? process.env.VOUCHR_PASSWORD;

if (!collectionId) {
  console.error('Error: --collection <id> is required.');
  console.error('Usage: node scripts/clear-tickets.mjs --collection <id> [--delay 100]');
  process.exit(1);
}

if (!username || !password) {
  console.error('Error: Cognito credentials are required.');
  console.error('Pass --username and --password flags or set VOUCHR_USERNAME / VOUCHR_PASSWORD env vars.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load AppSync config
// ---------------------------------------------------------------------------

let awsConfig;
try {
  const mod = await import(pathToFileURL(path.join(ROOT, 'src', 'aws-exports.js')).href);
  awsConfig = mod.default ?? mod;
} catch (err) {
  console.error('Error: could not load src/aws-exports.js.');
  console.error(err.message);
  process.exit(1);
}

const APPSYNC_ENDPOINT = awsConfig.aws_appsync_graphqlEndpoint;

if (!APPSYNC_ENDPOINT) {
  console.error('Error: aws_appsync_graphqlEndpoint not found in src/aws-exports.js.');
  process.exit(1);
}

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
// Auth
// ---------------------------------------------------------------------------

async function authenticate(user, pass) {
  await signIn({ username: user, password: pass });
  const session = await fetchAuthSession();
  const tokenStr = session.tokens?.idToken?.toString();
  if (!tokenStr) throw new Error('Auth succeeded but no idToken found in session.');
  return tokenStr;
}

// ---------------------------------------------------------------------------
// AppSync helpers
// ---------------------------------------------------------------------------

async function gql(token, query, variables = {}) {
  const res = await fetch(APPSYNC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

const LIST_QUERY = `
  query ListByCollection($ticketsID: ID!, $nextToken: String) {
    ticketsByTicketsID(ticketsID: $ticketsID, limit: 100, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteTicket($id: ID!) {
    deleteTicket(input: { id: $id }) { id }
  }
`;

async function fetchAllIds(token, collId) {
  const ids = [];
  let nextToken = null;
  do {
    const data = await gql(token, LIST_QUERY, { ticketsID: collId, nextToken });
    const page = data?.ticketsByTicketsID;
    for (const item of page?.items ?? []) {
      if (item?.id) ids.push(item.id);
    }
    nextToken = page?.nextToken ?? null;
  } while (nextToken);
  return ids;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\nVouchr ticket clear script`);
console.log(`  Collection : ${collectionId}`);
console.log(`  Delay      : ${delay}ms between deletes`);
console.log(`  Endpoint   : ${APPSYNC_ENDPOINT}`);
console.log('');

process.stdout.write('Authenticating with Cognito... ');
let token;
try {
  token = await authenticate(username, password);
  console.log('OK');
} catch (err) {
  console.error(`FAILED\n${err.message}`);
  process.exit(1);
}

process.stdout.write('Fetching ticket IDs... ');
let ids;
try {
  ids = await fetchAllIds(token, collectionId);
  console.log(`found ${ids.length}`);
} catch (err) {
  console.error(`FAILED\n${err.message}`);
  process.exit(1);
}

if (ids.length === 0) {
  console.log('Nothing to delete.');
  process.exit(0);
}

let deleted = 0;
let failed  = 0;
const errors = [];

for (let i = 0; i < ids.length; i++) {
  const id = ids[i];
  try {
    await gql(token, DELETE_MUTATION, { id });
    console.log(`[${i + 1}/${ids.length}] Deleted ${id} ✓`);
    deleted++;
  } catch (err) {
    console.error(`[${i + 1}/${ids.length}] FAILED ${id} — ${err.message}`);
    errors.push({ id, error: err.message });
    failed++;
  }

  if (i < ids.length - 1) await sleep(delay);
}

console.log('');
console.log('─'.repeat(50));
console.log('Clear complete.');
console.log(`  Deleted : ${deleted}`);
if (failed > 0) {
  console.log(`  Failed  : ${failed}`);
  errors.forEach(({ id, error }) => console.log(`    ${id}: ${error}`));
}
console.log('─'.repeat(50));

if (failed > 0) process.exit(1);
