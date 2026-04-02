/**
 * Tests for the timestamp utility used when creating tickets.
 *
 * AWSTimestamp expects Unix epoch SECONDS (Int), not milliseconds.
 * The boundary values are:
 *   - Seconds: current value is roughly 1.7e9 (< 2e10)
 *   - Milliseconds: current value is roughly 1.7e12 (> 1e12)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nowInSeconds } from '../utils/timestamp';

describe('nowInSeconds', () => {
  const FIXED_MS = 1_711_670_400_000; // 2024-03-29 00:00:00 UTC in milliseconds
  const FIXED_S  = 1_711_670_400;     // same moment in seconds

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_MS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the current time in whole seconds', () => {
    expect(nowInSeconds()).toBe(FIXED_S);
  });

  it('returns an integer (no fractional seconds)', () => {
    expect(Number.isInteger(nowInSeconds())).toBe(true);
  });

  it('value is less than 2e10 (seconds range, not milliseconds)', () => {
    // A milliseconds value like 1.7e12 would be > 2e10 and fail this check
    expect(nowInSeconds()).toBeLessThan(2e10);
  });

  it('value is greater than 1e9 (sanity: at least year 2001)', () => {
    expect(nowInSeconds()).toBeGreaterThan(1e9);
  });

  it('is NOT in millisecond range (not > 1e12)', () => {
    expect(nowInSeconds()).not.toBeGreaterThan(1e12);
  });

  it('matches Math.floor(Date.now() / 1000)', () => {
    expect(nowInSeconds()).toBe(Math.floor(FIXED_MS / 1000));
  });
});
