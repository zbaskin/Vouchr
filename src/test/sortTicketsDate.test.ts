/**
 * Tests for Error #2 — sortTickets used new Date("YYYY-MM-DD") which parses as UTC
 * midnight, then applied setHours() in local time.
 *
 * The parsing hazard:
 *   new Date("2024-03-15")          → UTC midnight (always)
 *   In UTC-5: that's Mar 14 at 19:00 local
 *   .setHours(19, 30)               → Mar 14 at 19:30 local  ← wrong calendar day!
 *
 * Sort ORDER is still preserved (both tickets are shifted equally) but the internal
 * Date objects hold wrong calendar dates, which is a correctness defect.
 *
 * Fix: extract buildEventDate(dateStr, timeStr) that constructs via
 *   new Date(year, month-1, day, hour, minute)
 * which always uses the local calendar and is timezone-safe.
 *
 * The buildEventDate tests verify that getFullYear/getMonth/getDate/getHours/
 * getMinutes all return the correct values — a property that would fail in any
 * non-UTC timezone with the old new Date(string) approach.
 *
 * Covers:
 * - buildEventDate returns correct local calendar parts
 * - buildEventDate returns null for missing/empty date strings
 * - buildEventDate defaults to 00:00 when time is missing
 * - buildEventDate handles HH:MM format (no seconds)
 * - EVENT_DATE sort orders correctly when events are on different calendar dates
 * - EVENT_DATE sort orders correctly when events are on the same date but different times
 * - Tickets with null/missing eventDate sort to the end
 * - ALPHABETICAL and TIME_CREATED sorts are unaffected
 */

import { describe, it, expect } from "vitest";
import { sortTickets, buildEventDate } from "../AppShell";
import { SortType } from "../API";
import type { Ticket } from "../API";

// ─── buildEventDate ────────────────────────────────────────────────────────

describe("buildEventDate — local time construction", () => {
  it("returns correct local calendar year, month, date", () => {
    const d = buildEventDate("2024-03-15", "19:30");
    expect(d?.getFullYear()).toBe(2024);
    expect(d?.getMonth()).toBe(2);   // 0-indexed: March = 2
    expect(d?.getDate()).toBe(15);   // Must be 15, NOT 14 (the UTC-parse trap)
  });

  it("returns correct local hours and minutes", () => {
    const d = buildEventDate("2024-03-15", "19:30");
    expect(d?.getHours()).toBe(19);
    expect(d?.getMinutes()).toBe(30);
  });

  it("defaults to 00:00 when time string is empty", () => {
    const d = buildEventDate("2024-06-01", "");
    expect(d?.getHours()).toBe(0);
    expect(d?.getMinutes()).toBe(0);
    expect(d?.getDate()).toBe(1);
  });

  it("returns null when dateStr is empty", () => {
    expect(buildEventDate("", "19:30")).toBeNull();
  });

  it("returns null when dateStr is undefined/null-like", () => {
    expect(buildEventDate(undefined as any, "19:30")).toBeNull();
  });

  it("handles HH:MM format (no seconds component)", () => {
    const d = buildEventDate("2024-06-15", "09:45");
    expect(d?.getHours()).toBe(9);
    expect(d?.getMinutes()).toBe(45);
  });

  it("handles HH:MM:SS format (with seconds component)", () => {
    const d = buildEventDate("2024-06-15", "09:45:00");
    expect(d?.getHours()).toBe(9);
    expect(d?.getMinutes()).toBe(45);
  });
});

// ─── sortTickets ────────────────────────────────────────────────────────────

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket =>
  ({
    id: "t-1",
    name: "Ticket",
    ticketsID: "col-1",
    owner: "sub-1",
    type: "MOVIE",
    timeCreated: 1000,
    visibility: "PRIVATE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  } as Ticket);

describe("sortTickets — EVENT_DATE", () => {
  it("orders tickets by event date descending (newest first)", () => {
    const tickets = [
      makeTicket({ id: "old", name: "Old", eventDate: "2024-01-01", eventTime: "10:00:00" }),
      makeTicket({ id: "new", name: "New", eventDate: "2024-06-15", eventTime: "10:00:00" }),
      makeTicket({ id: "mid", name: "Mid", eventDate: "2024-03-20", eventTime: "10:00:00" }),
    ];

    const result = sortTickets(tickets, SortType.EVENT_DATE);
    expect(result.map((t) => t.id)).toEqual(["new", "mid", "old"]);
  });

  it("breaks ties by time when two tickets share the same date — later time first", () => {
    const tickets = [
      makeTicket({ id: "morning", name: "Morning", eventDate: "2024-06-15", eventTime: "09:00:00" }),
      makeTicket({ id: "evening", name: "Evening", eventDate: "2024-06-15", eventTime: "19:30:00" }),
      makeTicket({ id: "noon",    name: "Noon",    eventDate: "2024-06-15", eventTime: "12:00:00" }),
    ];

    const result = sortTickets(tickets, SortType.EVENT_DATE);
    expect(result.map((t) => t.id)).toEqual(["evening", "noon", "morning"]);
  });

  it("treats a ticket with no eventDate as oldest (sorts to the end)", () => {
    const tickets = [
      makeTicket({ id: "no-date", name: "No date", eventDate: undefined }),
      makeTicket({ id: "dated",   name: "Dated",   eventDate: "2024-06-15", eventTime: "10:00:00" }),
    ];

    const result = sortTickets(tickets, SortType.EVENT_DATE);
    expect(result.map((t) => t.id)).toEqual(["dated", "no-date"]);
  });

  it("defaults to 00:00 when eventTime is missing", () => {
    const tickets = [
      makeTicket({ id: "no-time",   name: "No time",   eventDate: "2024-06-15", eventTime: undefined }),
      makeTicket({ id: "with-time", name: "With time", eventDate: "2024-06-15", eventTime: "08:00:00" }),
    ];

    // "with-time" is at 08:00, "no-time" defaults to 00:00 → "with-time" is later (first)
    const result = sortTickets(tickets, SortType.EVENT_DATE);
    expect(result.map((t) => t.id)).toEqual(["with-time", "no-time"]);
  });

  it("correctly distinguishes events on consecutive dates regardless of timezone", () => {
    // This is the core timezone regression test.
    // With the broken new Date("YYYY-MM-DD") approach, "2024-03-15" in UTC-5
    // becomes Mar 14 local-time, making Mar-15 and Mar-14 tickets appear equal
    // after setHours. The fix must keep them on their correct local calendar dates.
    const tickets = [
      makeTicket({ id: "mar-14", name: "Mar 14", eventDate: "2024-03-14", eventTime: "19:30:00" }),
      makeTicket({ id: "mar-15", name: "Mar 15", eventDate: "2024-03-15", eventTime: "19:30:00" }),
    ];

    // Mar 15 is later → should come first
    const result = sortTickets(tickets, SortType.EVENT_DATE);
    expect(result.map((t) => t.id)).toEqual(["mar-15", "mar-14"]);
  });

  it("handles eventTime in HH:MM format (no seconds)", () => {
    const tickets = [
      makeTicket({ id: "t1", name: "T1", eventDate: "2024-06-15", eventTime: "09:00" }),
      makeTicket({ id: "t2", name: "T2", eventDate: "2024-06-15", eventTime: "20:00" }),
    ];

    const result = sortTickets(tickets, SortType.EVENT_DATE);
    expect(result.map((t) => t.id)).toEqual(["t2", "t1"]);
  });
});

describe("sortTickets — ALPHABETICAL", () => {
  it("orders tickets A→Z by name", () => {
    const tickets = [
      makeTicket({ id: "c", name: "Charlie" }),
      makeTicket({ id: "a", name: "Alice" }),
      makeTicket({ id: "b", name: "Bob" }),
    ];

    const result = sortTickets(tickets, SortType.ALPHABETICAL);
    expect(result.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });
});

describe("sortTickets — TIME_CREATED", () => {
  it("orders tickets by timeCreated descending (newest first)", () => {
    const tickets = [
      makeTicket({ id: "first",  name: "First",  timeCreated: 1000 }),
      makeTicket({ id: "third",  name: "Third",  timeCreated: 3000 }),
      makeTicket({ id: "second", name: "Second", timeCreated: 2000 }),
    ];

    const result = sortTickets(tickets, SortType.TIME_CREATED);
    expect(result.map((t) => t.id)).toEqual(["third", "second", "first"]);
  });
});
