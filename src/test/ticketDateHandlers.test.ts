/**
 * Tests for Bug #1 — handleTicketDate / handleTicketTime null/undefined guards.
 *
 * Problem: Both functions were called unconditionally on every ticket render.
 * When `eventDate` or `eventTime` is null/undefined (both are nullable in the
 * GraphQL schema), `date.split("-")` and `time.substring(0, 5)` throw a
 * TypeError, white-screening the entire app because there are no error
 * boundaries.
 *
 * Fix: Both functions must accept `string | null | undefined` and return a
 * fallback string instead of throwing.
 */

import { describe, it, expect } from 'vitest';
import { handleTicketDate, handleTicketTime } from '../utils/ticketFormat';

// ---------------------------------------------------------------------------
// handleTicketDate
// ---------------------------------------------------------------------------

describe('handleTicketDate — valid input', () => {
  it('formats "2024-07-15" correctly', () => {
    // Original implementation builds "MM/DD/YYYY" from the split parts.
    expect(handleTicketDate('2024-07-15')).toBe('07/15/2024');
  });

  it('formats "2000-01-01" correctly', () => {
    expect(handleTicketDate('2000-01-01')).toBe('01/01/2000');
  });

  it('formats "1999-12-31" correctly', () => {
    expect(handleTicketDate('1999-12-31')).toBe('12/31/1999');
  });
});

describe('handleTicketDate — null / undefined / empty (Bug #1)', () => {
  it('returns a fallback string for null without throwing', () => {
    expect(() => handleTicketDate(null as unknown as string)).not.toThrow();
    const result = handleTicketDate(null as unknown as string);
    // Must be a string (empty string or dash placeholder)
    expect(typeof result).toBe('string');
  });

  it('returns a fallback string for undefined without throwing', () => {
    expect(() => handleTicketDate(undefined as unknown as string)).not.toThrow();
    const result = handleTicketDate(undefined as unknown as string);
    expect(typeof result).toBe('string');
  });

  it('returns a fallback string for empty string without throwing', () => {
    expect(() => handleTicketDate('')).not.toThrow();
    const result = handleTicketDate('');
    expect(typeof result).toBe('string');
  });

  it('null fallback is "" or "—" (not a real date string)', () => {
    const result = handleTicketDate(null as unknown as string);
    expect(['', '—']).toContain(result);
  });

  it('undefined fallback is "" or "—"', () => {
    const result = handleTicketDate(undefined as unknown as string);
    expect(['', '—']).toContain(result);
  });

  it('empty-string fallback is "" or "—"', () => {
    const result = handleTicketDate('');
    expect(['', '—']).toContain(result);
  });
});

// ---------------------------------------------------------------------------
// handleTicketTime
// ---------------------------------------------------------------------------

describe('handleTicketTime — valid input', () => {
  it('formats "14:30:00" as "2:30pm"', () => {
    expect(handleTicketTime('14:30:00')).toBe('2:30pm');
  });

  it('formats "12:00:00" as "12:00pm"', () => {
    expect(handleTicketTime('12:00:00')).toBe('12:00pm');
  });

  it('formats "00:00:00" as "12:00am"', () => {
    expect(handleTicketTime('00:00:00')).toBe('12:00am');
  });

  it('formats "09:05:00" as "9:05am"', () => {
    expect(handleTicketTime('09:05:00')).toBe('9:05am');
  });

  it('formats "23:59:00" as "11:59pm"', () => {
    expect(handleTicketTime('23:59:00')).toBe('11:59pm');
  });

  it('formats "12:30" (no seconds) as "12:30pm"', () => {
    expect(handleTicketTime('12:30')).toBe('12:30pm');
  });
});

describe('handleTicketTime — null / undefined / empty (Bug #1)', () => {
  it('returns a fallback string for null without throwing', () => {
    expect(() => handleTicketTime(null as unknown as string)).not.toThrow();
    const result = handleTicketTime(null as unknown as string);
    expect(typeof result).toBe('string');
  });

  it('returns a fallback string for undefined without throwing', () => {
    expect(() => handleTicketTime(undefined as unknown as string)).not.toThrow();
    const result = handleTicketTime(undefined as unknown as string);
    expect(typeof result).toBe('string');
  });

  it('returns a fallback string for empty string without throwing', () => {
    expect(() => handleTicketTime('')).not.toThrow();
    const result = handleTicketTime('');
    expect(typeof result).toBe('string');
  });

  it('null fallback is "" or "—"', () => {
    const result = handleTicketTime(null as unknown as string);
    expect(['', '—']).toContain(result);
  });

  it('undefined fallback is "" or "—"', () => {
    const result = handleTicketTime(undefined as unknown as string);
    expect(['', '—']).toContain(result);
  });

  it('empty-string fallback is "" or "—"', () => {
    const result = handleTicketTime('');
    expect(['', '—']).toContain(result);
  });
});
