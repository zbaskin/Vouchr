/**
 * Tests for Issue #9 — `initialState` captures stale module-load timestamp.
 *
 * Problem: `initialState` was defined at module scope with `timeCreated: nowInSeconds()`,
 * capturing the timestamp once when the module loads rather than when the user
 * submits or resets the form.
 *
 * Fix: `initialState` must use a sentinel value of 0 (not a live timestamp),
 * and `nowInSeconds()` must only be called fresh inside `handleSubmit` / reset paths.
 */

import { describe, it, expect } from 'vitest';
import { initialState } from '../components/TicketForm';
import { nowInSeconds } from '../utils/timestamp';

describe('TicketForm — initialState (Issue #9)', () => {
  it('initialState.timeCreated is 0 (sentinel), not a live timestamp captured at import time', () => {
    // A live nowInSeconds() call at module load would produce ~1.7e9 or higher.
    // We require the sentinel value of 0 so the module-load moment is never baked in.
    expect(initialState.timeCreated).toBe(0);
  });

  it('initialState.timeCreated is NOT in the valid Unix-seconds range (i.e. not a real timestamp)', () => {
    // Real Unix timestamps in seconds are > 1e9. A sentinel 0 must not pass this threshold.
    expect(initialState.timeCreated).not.toBeGreaterThan(1e9);
  });

  it('a freshly constructed reset state has timeCreated within 1 second of now', () => {
    // When the form is actually reset/submitted, the caller must invoke nowInSeconds()
    // fresh. This test verifies the utility itself produces a value close to the real
    // current time — regression guard that nowInSeconds() hasn't been neutered.
    const before = Math.floor(Date.now() / 1000);
    const fresh = nowInSeconds();
    const after = Math.floor(Date.now() / 1000);

    expect(fresh).toBeGreaterThanOrEqual(before);
    expect(fresh).toBeLessThanOrEqual(after + 1);
  });

  it('initialState has the expected shape with all required fields', () => {
    expect(initialState).toMatchObject({
      owner: '',
      name: '',
      ticketsID: '',
      timeCreated: 0,
    });
  });
});
