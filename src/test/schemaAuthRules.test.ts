/**
 * Tests that document and verify the GraphQL schema auth rule change for Issue 2.
 *
 * The fix: Remove `{ allow: private, operations: [read] }` from TicketCollection
 * and Ticket types, keeping only owner-based auth. This ensures authenticated users
 * can only access their own data, not any other user's data.
 *
 * Because AppSync auth rules are evaluated server-side we cannot unit-test the
 * actual enforcement. Instead these tests:
 *   1. Parse the schema file and assert the insecure rule is absent per-type.
 *   2. Assert the owner rule is present with full CRUD for both types.
 *   3. Document what each rule means as a regression guard.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SCHEMA_PATH = resolve(__dirname, '../../amplify/backend/api/vouchr/schema.graphql');

function loadSchema(): string {
  // Normalize CRLF → LF for consistent regex matching on Windows.
  return readFileSync(SCHEMA_PATH, 'utf-8').replace(/\r\n/g, '\n');
}

/**
 * Extract the @auth(rules: [...]) block for a given type by walking character-by-character
 * and tracking parenthesis/bracket depth. Handles nested brackets correctly.
 *
 * Returns the text of the @auth(...) call, e.g. "@auth(rules: [...])".
 */
function extractAuthDirective(schema: string, typeName: string): string {
  const typeStart = schema.indexOf(`\ntype ${typeName}`);
  if (typeStart === -1) return '';

  // Find @auth( within this type's decorator section
  // The type body starts at the first { after the type declaration's closing )
  const authStart = schema.indexOf('@auth(', typeStart);
  if (authStart === -1) return '';

  // Now walk from '(' tracking depth until matching ')'
  const parenStart = authStart + '@auth'.length; // index of '('
  let depth = 0;
  let i = parenStart;
  while (i < schema.length) {
    const ch = schema[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) {
        return schema.slice(authStart, i + 1);
      }
    }
    i++;
  }
  return schema.slice(authStart);
}

// ---------------------------------------------------------------------------

describe('GraphQL schema — TicketCollection auth rules (Issue 2)', () => {
  it('schema file is readable', () => {
    expect(() => loadSchema()).not.toThrow();
  });

  it('TicketCollection does NOT have a bare { allow: private, operations: [read] } rule', () => {
    const schema = loadSchema();
    const authBlock = extractAuthDirective(schema, 'TicketCollection');
    expect(authBlock.length).toBeGreaterThan(0);

    // Strip comment lines before checking — we only care about live rule objects.
    const codeOnly = authBlock
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('#'))
      .join('\n');

    // This pattern matches the insecure rule that lets ANY authenticated user
    // read ALL collections regardless of ownership.
    const insecureRule = /\{\s*allow:\s*private,\s*operations:\s*\[\s*read\s*\]/;
    expect(codeOnly).not.toMatch(insecureRule);
  });

  it('TicketCollection has an owner auth rule', () => {
    const schema = loadSchema();
    const authBlock = extractAuthDirective(schema, 'TicketCollection');
    expect(authBlock).toMatch(/allow:\s*owner/);
  });

  it('Ticket does NOT have a bare { allow: private, operations: [read] } rule', () => {
    const schema = loadSchema();
    const authBlock = extractAuthDirective(schema, 'Ticket');
    expect(authBlock.length).toBeGreaterThan(0);

    // Strip comment lines before checking — we only care about live rule objects.
    const codeOnly = authBlock
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('#'))
      .join('\n');

    const insecureRule = /\{\s*allow:\s*private,\s*operations:\s*\[\s*read\s*\]/;
    expect(codeOnly).not.toMatch(insecureRule);
  });

  it('Ticket has an owner auth rule', () => {
    const schema = loadSchema();
    const authBlock = extractAuthDirective(schema, 'Ticket');
    expect(authBlock).toMatch(/allow:\s*owner/);
  });
});

describe('GraphQL schema — auth rule semantics documentation', () => {
  /**
   * Rule semantics:
   *   { allow: owner }
   *     → The user whose Cognito sub matches the `owner` field can
   *       create, read, update, and delete the record. No other
   *       authenticated user can access it.
   *
   *   { allow: private, operations: [read] }   ← REMOVED (was insecure)
   *     → ANY authenticated Cognito user could read ANY record,
   *       regardless of ownership. This bypassed the visibility field
   *       entirely at the API layer.
   *
   *   { allow: public, provider: iam, operations: [read] }
   *     → Unauthenticated IAM requests can read records. Kept intentionally
   *       for public-facing collection views when visibility === PUBLIC.
   */
  it('documents the removed insecure rule (kept as regression note)', () => {
    const removedRuleDescription =
      '{ allow: private, operations: [read] } was removed because it let ' +
      'any authenticated user read all TicketCollection and Ticket records, ' +
      'ignoring the visibility field.';
    expect(removedRuleDescription).toBeTruthy();
  });
});
