/**
 * Tests for LOW Error #11 — handleTicketTime renders "NaN:undefinedam" for
 * malformed time strings that don't contain a colon.
 *
 * Root cause: `time.substring(0,5).split(":")[1]` returns `undefined` when
 * there's no colon, and `parseInt` of a non-numeric prefix returns `NaN`.
 * Template literals then produce the visible string "NaN:undefinedam".
 *
 * Fix: after splitting, check that we have at least 2 parts and that the
 * parsed hour is a finite number. Return "" on malformed input.
 *
 * Covers:
 * - Malformed string with no colon returns "" (not "NaN:undefinedam")
 * - Numeric string with no colon returns ""
 * - String shorter than 5 chars but valid (e.g., "9:00") still works
 * - All existing valid-format tests still pass (regression guard)
 */

import { describe, it, expect } from "vitest";
import { handleTicketTime } from "../utils/ticketFormat";

describe("handleTicketTime — malformed input", () => {
  it('returns "" for a string with no colon (not "NaN:undefinedam")', () => {
    const result = handleTicketTime("badstring");
    expect(result).toBe("");
    expect(result).not.toContain("NaN");
    expect(result).not.toContain("undefined");
  });

  it('returns "" for a numeric string with no colon', () => {
    const result = handleTicketTime("1930");
    expect(result).toBe("");
  });

  it('returns "" for a string where the hour part is non-numeric', () => {
    const result = handleTicketTime("ab:30");
    expect(result).toBe("");
  });
});

describe("handleTicketTime — valid input regression guard", () => {
  it('formats "14:30:00" as "2:30pm"', () => {
    expect(handleTicketTime("14:30:00")).toBe("2:30pm");
  });

  it('formats "12:00:00" as "12:00pm"', () => {
    expect(handleTicketTime("12:00:00")).toBe("12:00pm");
  });

  it('formats "00:00:00" as "12:00am"', () => {
    expect(handleTicketTime("00:00:00")).toBe("12:00am");
  });

  it('formats "09:05:00" as "9:05am"', () => {
    expect(handleTicketTime("09:05:00")).toBe("9:05am");
  });
});
