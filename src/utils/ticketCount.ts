/**
 * Pure helper for computing the next ticket count.
 *
 * Exported so it can be unit-tested independently of the Amplify client.
 *
 * Rules:
 *   - delta should be +1 (add ticket) or -1 (remove ticket).
 *   - The result is clamped to a minimum of 0 (count can never go negative).
 */

export interface TicketCountAdjustParams {
  currentCount: number | null | undefined;
  delta: number;
}

/**
 * Compute the new ticketCount given the current count and a delta.
 * Clamps the result to >= 0.
 *
 * @param currentCount - The latest count fetched from the server.
 * @param delta        - The amount to adjust (+1 or -1).
 */
export function computeNextCount(currentCount: number | null | undefined, delta: number): number {
  return Math.max(0, (currentCount ?? 0) + delta);
}
