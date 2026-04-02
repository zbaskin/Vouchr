/**
 * Unit tests for the adjustTicketCount logic.
 *
 * The function must:
 * 1. Fetch the LATEST count from the server immediately before writing (no stale state).
 * 2. Accept a delta (+1 or -1), never an absolute value.
 * 3. Never let ticketCount go below 0.
 * 4. Retry on conflict errors up to maxRetries times.
 * 5. Return the new ticketCount on success.
 * 6. Return null when the collection is not found.
 * 7. Re-throw non-conflict errors.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeNextCount, type TicketCountAdjustParams } from '../utils/ticketCount';

// ---------------------------------------------------------------------------
// Pure helper: computeNextCount
// ---------------------------------------------------------------------------

describe('computeNextCount', () => {
  it('increments current count by delta +1', () => {
    expect(computeNextCount(5, +1)).toBe(6);
  });

  it('decrements current count by delta -1', () => {
    expect(computeNextCount(3, -1)).toBe(2);
  });

  it('clamps to 0 — never returns negative count', () => {
    expect(computeNextCount(0, -1)).toBe(0);
  });

  it('clamps to 0 when delta would make count deeply negative', () => {
    expect(computeNextCount(0, -5)).toBe(0);
  });

  it('treats null currentCount as 0 before applying delta', () => {
    const params: TicketCountAdjustParams = { currentCount: null, delta: +1 };
    // Pass null directly so the ?? branch inside computeNextCount is exercised.
    expect(computeNextCount(params.currentCount, params.delta)).toBe(1);
  });

  it('treats undefined currentCount as 0 before applying delta', () => {
    expect(computeNextCount(undefined, +1)).toBe(1);
  });

  it('handles large positive deltas', () => {
    expect(computeNextCount(100, +50)).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// adjustTicketCount — integration tests with mocked Amplify client
// ---------------------------------------------------------------------------

// Use vi.hoisted so that mockAmplifyClient is available inside the vi.mock factory,
// which is hoisted to the top of the file by Vitest's transform.
const { mockAmplifyClient } = vi.hoisted(() => {
  const mockAmplifyClient = { graphql: vi.fn() };
  return { mockAmplifyClient };
});

vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(() => mockAmplifyClient),
}));

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ userId: 'test-sub' })),
  fetchAuthSession: vi.fn(async () => ({ tokens: { idToken: 'tok' } })),
}));

vi.mock('../graphql/mutations', () => ({
  createTicket: 'createTicketMutation',
  createTicketCollection: 'createTicketCollectionMutation',
  deleteTicket: 'deleteTicketMutation',
  updateTicketCollection: 'updateTicketCollectionMutation',
  updateTicket: 'updateTicketMutation',
}));

vi.mock('../graphql/queries', () => ({
  getTicketCollection: 'getTicketCollectionQuery',
  ticketsByTicketsID: 'ticketsByTicketsIDQuery',
}));

import { adjustTicketCount } from '../ticketService';

const COLLECTION_ID = 'col-123';

function makeReadResponse(ticketCount: number) {
  return {
    data: {
      getTicketCollection: { id: COLLECTION_ID, ticketCount },
    },
  };
}

function makeWriteResponse(ticketCount: number) {
  return {
    data: {
      updateTicketCollection: { id: COLLECTION_ID, ticketCount },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------

describe('adjustTicketCount — happy path', () => {
  it('increments ticketCount by fetching latest value then writing +1', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(4))   // read
      .mockResolvedValueOnce(makeWriteResponse(5)); // write

    const result = await adjustTicketCount(COLLECTION_ID, +1);

    expect(result).toBe(5);
    // Verify write was called with next = 4 + 1 = 5
    const writeCall = mockAmplifyClient.graphql.mock.calls[1][0];
    expect(writeCall.variables.input.ticketCount).toBe(5);
  });

  it('decrements ticketCount by fetching latest value then writing -1', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(3))
      .mockResolvedValueOnce(makeWriteResponse(2));

    const result = await adjustTicketCount(COLLECTION_ID, -1);

    expect(result).toBe(2);
    const writeCall = mockAmplifyClient.graphql.mock.calls[1][0];
    expect(writeCall.variables.input.ticketCount).toBe(2);
  });

  it('clamps ticketCount to 0 when current is 0 and delta is -1', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(0))
      .mockResolvedValueOnce(makeWriteResponse(0));

    const result = await adjustTicketCount(COLLECTION_ID, -1);

    expect(result).toBe(0);
    const writeCall = mockAmplifyClient.graphql.mock.calls[1][0];
    expect(writeCall.variables.input.ticketCount).toBe(0);
  });
});

describe('adjustTicketCount — collection not found', () => {
  it('returns null when getTicketCollection returns null', async () => {
    mockAmplifyClient.graphql.mockResolvedValueOnce({
      data: { getTicketCollection: null },
    });

    const result = await adjustTicketCount(COLLECTION_ID, +1);
    expect(result).toBeNull();
  });
});

describe('adjustTicketCount — retry on conflict', () => {
  it('retries on ConditionalCheckFailed and succeeds on second attempt', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(2))             // read attempt 1
      .mockRejectedValueOnce({                                // write attempt 1 — conflict
        errors: [{ message: 'ConditionalCheckFailed' }],
      })
      .mockResolvedValueOnce(makeReadResponse(3))             // read attempt 2 (fresh)
      .mockResolvedValueOnce(makeWriteResponse(4));           // write attempt 2 — success

    const result = await adjustTicketCount(COLLECTION_ID, +1, 3);
    expect(result).toBe(4);

    // Must have read TWICE — proving it re-fetches the latest value after conflict
    const readCalls = mockAmplifyClient.graphql.mock.calls.filter(
      (c) => c[0].query === 'getTicketCollectionQuery'
    );
    expect(readCalls).toHaveLength(2);
  });

  it('returns null after exhausting all retries', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(1))
      .mockRejectedValueOnce({ errors: [{ message: 'ConditionalCheckFailed' }] })
      .mockResolvedValueOnce(makeReadResponse(1))
      .mockRejectedValueOnce({ errors: [{ message: 'ConditionalCheckFailed' }] })
      .mockResolvedValueOnce(makeReadResponse(1))
      .mockRejectedValueOnce({ errors: [{ message: 'ConditionalCheckFailed' }] });

    const result = await adjustTicketCount(COLLECTION_ID, +1, 3);
    expect(result).toBeNull();
  });

  it('re-throws non-conflict errors without retrying', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(2))
      .mockRejectedValueOnce({ errors: [{ message: 'UnauthorizedException' }] });

    await expect(adjustTicketCount(COLLECTION_ID, +1)).rejects.toMatchObject({
      errors: [{ message: 'UnauthorizedException' }],
    });
    // Only one read + one write attempt = 2 total calls (no retry)
    expect(mockAmplifyClient.graphql).toHaveBeenCalledTimes(2);
  });
});

describe('adjustTicketCount — always re-reads before writing', () => {
  it('issues a read call before every write call', async () => {
    mockAmplifyClient.graphql
      .mockResolvedValueOnce(makeReadResponse(7))
      .mockResolvedValueOnce(makeWriteResponse(8));

    await adjustTicketCount(COLLECTION_ID, +1);

    // First call must be a read (getTicketCollection query)
    const firstCall = mockAmplifyClient.graphql.mock.calls[0][0];
    expect(firstCall.query).toBe('getTicketCollectionQuery');

    // Second call must be a write (updateTicketCollection)
    const secondCall = mockAmplifyClient.graphql.mock.calls[1][0];
    expect(secondCall.variables.input).toHaveProperty('ticketCount');
  });
});
