/**
 * Tests for normalizeSort in AppShell.tsx.
 *
 * EVENT_TYPE is intentionally kept in the SortType enum (future feature: concert/sport tickets)
 * but is not yet wired up in the UI. normalizeSort returns null for it until implemented.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { normalizeSort } from '../utils/sort';

const SCHEMA_PATH = resolve(__dirname, '../../amplify/backend/api/vouchr/schema.graphql');

function loadSchema(): string {
  return readFileSync(SCHEMA_PATH, 'utf-8').replace(/\r\n/g, '\n');
}

// ---------------------------------------------------------------------------
// normalizeSort — valid values
// ---------------------------------------------------------------------------

describe('normalizeSort — valid sort values', () => {
  it('returns SortType.ALPHABETICAL for "ALPHABETICAL"', () => {
    const result = normalizeSort('ALPHABETICAL');
    expect(result).toBe('ALPHABETICAL');
  });

  it('returns SortType.EVENT_DATE for "EVENT_DATE"', () => {
    const result = normalizeSort('EVENT_DATE');
    expect(result).toBe('EVENT_DATE');
  });

  it('returns SortType.TIME_CREATED for "TIME_CREATED"', () => {
    const result = normalizeSort('TIME_CREATED');
    expect(result).toBe('TIME_CREATED');
  });

  it('is case-insensitive — accepts lowercase "alphabetical"', () => {
    const result = normalizeSort('alphabetical');
    expect(result).toBe('ALPHABETICAL');
  });

  it('is case-insensitive — accepts mixed-case "Event_Date"', () => {
    const result = normalizeSort('Event_Date');
    expect(result).toBe('EVENT_DATE');
  });
});

// ---------------------------------------------------------------------------
// normalizeSort — invalid / unknown values
// ---------------------------------------------------------------------------

describe('normalizeSort — invalid/unknown values return null', () => {
  it('returns null for undefined', () => {
    expect(normalizeSort(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(normalizeSort(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeSort('')).toBeNull();
  });

  it('returns null for a random unknown string', () => {
    expect(normalizeSort('BOGUS_SORT')).toBeNull();
  });

  it('returns null for "EVENT_TYPE" — not yet wired up in the UI', () => {
    expect(normalizeSort('EVENT_TYPE')).toBeNull();
  });

  it('returns null for lowercase "event_type"', () => {
    expect(normalizeSort('event_type')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Schema file — EVENT_TYPE must not be present in the SortType enum
// ---------------------------------------------------------------------------

describe('GraphQL schema — SortType enum (Issue #17)', () => {
  it('schema file is readable', () => {
    expect(() => loadSchema()).not.toThrow();
  });

  it('SortType enum exists in the schema', () => {
    const schema = loadSchema();
    expect(schema).toMatch(/enum\s+SortType\s*\{/);
  });

  it('EVENT_TYPE IS present in the SortType enum (reserved for future event types)', () => {
    const schema = loadSchema();
    const match = schema.match(/enum\s+SortType\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const enumBody = match![1];
    expect(enumBody).toMatch(/\bEVENT_TYPE\b/);
  });

  it('SortType enum still contains ALPHABETICAL, EVENT_DATE, and TIME_CREATED', () => {
    const schema = loadSchema();
    const match = schema.match(/enum\s+SortType\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();

    const enumBody = match![1];
    expect(enumBody).toMatch(/\bALPHABETICAL\b/);
    expect(enumBody).toMatch(/\bEVENT_DATE\b/);
    expect(enumBody).toMatch(/\bTIME_CREATED\b/);
  });
});
