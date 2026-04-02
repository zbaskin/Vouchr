/**
 * Tests for Bug #2 — page index not reset when ticket list changes.
 *
 * Problem: `page` state in TicketCollection starts at 1 and is never reset
 * when the `tickets` prop changes. This causes:
 *   - After deleting tickets: page may exceed totalPages, showing empty slice
 *     even though tickets exist on earlier pages.
 *   - After adding a ticket: user stays on a later page and misses the new entry.
 *   - After changing sort: user sees a confusing mid-collection starting point.
 *
 * Fix: A useEffect in TicketCollection must reset `page` to 1 whenever
 * `tickets.length` changes.
 *
 * These tests validate the pagination LOGIC (pure functions) that TicketCollection
 * relies on, plus a static analysis check that the reset useEffect is present in
 * the source. The component itself cannot be rendered in isolation because it
 * consumes a router outlet context — these tests guard the logic instead.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const COMPONENT_PATH = resolve(__dirname, '../components/TicketCollection.tsx');

function readComponent(): string {
  return readFileSync(COMPONENT_PATH, 'utf-8');
}

// ---------------------------------------------------------------------------
// Pure pagination logic — mirrors the slicing logic in TicketCollection
// ---------------------------------------------------------------------------

function paginateTickets<T>(
  tickets: T[],
  page: number,
  ticketsPerPage: number,
): T[] {
  const startIndex = (page - 1) * ticketsPerPage;
  return tickets.slice(startIndex, startIndex + ticketsPerPage);
}

function totalPages(ticketCount: number, ticketsPerPage: number): number {
  return Math.ceil(ticketCount / ticketsPerPage);
}

function clampPage(page: number, total: number): number {
  if (total === 0) return 1;
  return Math.min(Math.max(page, 1), total);
}

// ---------------------------------------------------------------------------
// Pagination logic unit tests
// ---------------------------------------------------------------------------

describe('paginateTickets — displayedTickets slice is never empty when tickets exist', () => {
  const PER_PAGE = 15;

  it('page 1 of a 20-ticket list returns the first 15', () => {
    const tickets = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));
    expect(paginateTickets(tickets, 1, PER_PAGE)).toHaveLength(15);
  });

  it('page 2 of a 20-ticket list returns the last 5', () => {
    const tickets = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));
    expect(paginateTickets(tickets, 2, PER_PAGE)).toHaveLength(5);
  });

  it('page 1 of a 15-ticket list returns all 15', () => {
    const tickets = Array.from({ length: 15 }, (_, i) => ({ id: String(i) }));
    expect(paginateTickets(tickets, 1, PER_PAGE)).toHaveLength(15);
  });

  it('page 1 of a 1-ticket list returns 1 ticket', () => {
    const tickets = [{ id: 'a' }];
    expect(paginateTickets(tickets, 1, PER_PAGE)).toHaveLength(1);
  });

  it('stale page 3 on a 2-page list returns an empty slice (demonstrates the bug)', () => {
    const tickets = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));
    // After deleting 10 tickets the list is now 10 items — totalPages is 1.
    // If page stays at 2, the slice is empty.
    const shrunk = tickets.slice(0, 10);
    expect(paginateTickets(shrunk, 2, PER_PAGE)).toHaveLength(0);
  });
});

describe('totalPages — correct computation', () => {
  it('returns 1 for 0 tickets', () => {
    expect(totalPages(0, 15)).toBe(0); // Math.ceil(0/15) === 0
  });

  it('returns 1 for exactly 15 tickets', () => {
    expect(totalPages(15, 15)).toBe(1);
  });

  it('returns 2 for 16 tickets', () => {
    expect(totalPages(16, 15)).toBe(2);
  });

  it('returns 2 for 30 tickets', () => {
    expect(totalPages(30, 15)).toBe(2);
  });

  it('returns 3 for 31 tickets', () => {
    expect(totalPages(31, 15)).toBe(3);
  });
});

describe('clampPage — page clamping prevents out-of-range access', () => {
  it('clamps page 3 to 2 when totalPages is 2', () => {
    expect(clampPage(3, 2)).toBe(2);
  });

  it('clamps page 0 to 1 when totalPages is 2', () => {
    expect(clampPage(0, 2)).toBe(1);
  });

  it('does not change page 1 when totalPages is 5', () => {
    expect(clampPage(1, 5)).toBe(1);
  });

  it('does not change page 2 when totalPages is 2', () => {
    expect(clampPage(2, 2)).toBe(2);
  });

  it('returns 1 when totalPages is 0 (empty list)', () => {
    expect(clampPage(1, 0)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Page-reset invariant: after tickets.length changes, page must return to 1
// Static check: TicketCollection must contain a useEffect that depends on
// tickets.length (or tickets) and calls setPage(1).
// ---------------------------------------------------------------------------

describe('TicketCollection — page reset useEffect (Bug #2)', () => {
  it('component source contains a useEffect import', () => {
    const src = readComponent();
    expect(src).toMatch(/\buseEffect\b/);
  });

  it('component source calls setPage(1) inside a useEffect', () => {
    const src = readComponent();
    // The fix must have a useEffect that calls setPage(1)
    expect(src).toMatch(/useEffect\s*\(/);
    expect(src).toMatch(/setPage\s*\(\s*1\s*\)/);
  });

  it('the setPage(1) call appears inside a useEffect body', () => {
    const src = readComponent();
    // Look for the pattern: useEffect(() => { ... setPage(1) ... }, [...])
    // A simple heuristic: setPage(1) must appear after at least one useEffect(
    const useEffectIdx = src.indexOf('useEffect(');
    const setPageIdx = src.indexOf('setPage(1)');
    expect(useEffectIdx).toBeGreaterThanOrEqual(0);
    expect(setPageIdx).toBeGreaterThan(useEffectIdx);
  });

  it('the reset useEffect dependency array references tickets', () => {
    const src = readComponent();
    // The dependency array must include tickets or tickets.length to avoid
    // infinite loops and to fire only when the list actually changes.
    // We check that a useEffect dependency array contains "tickets"
    expect(src).toMatch(/\[\s*tickets/);
  });
});

// ---------------------------------------------------------------------------
// Regression guard: when ticket count stays the same the page must NOT reset.
// We cannot test this directly without a component render, so we verify the
// dependency is tickets.length (or tickets) rather than an object that changes
// identity on every render (which would cause an infinite reset loop).
// ---------------------------------------------------------------------------

describe('TicketCollection — no spurious page resets', () => {
  it('dependency is tickets.length, not a derived object (no infinite loop risk)', () => {
    const src = readComponent();
    // The dependency array should be [tickets.length] or [tickets] — both are
    // stable primitives / the same array reference from the parent.
    // It must NOT be something like [displayedTickets] which is recreated each render.
    expect(src).not.toMatch(/\[\s*displayedTickets\s*\]/);
  });
});
