/**
 * Tests for Error #2 (part 1 of 2) — fetchTickets swallows errors.
 *
 * Root cause: fetchTickets wraps everything in try/catch and returns [] on any
 * error. The caller cannot distinguish "user has no tickets" from "network failed",
 * so it silently wipes the existing ticket list.
 *
 * Fix: remove the catch block from fetchTickets so errors propagate to callers,
 * who can then decide whether to preserve existing state and show an error UI.
 *
 * Covers:
 * - fetchTickets throws when the GraphQL call rejects
 * - fetchTickets throws when the response has no `data` key
 * - fetchTickets returns tickets normally on success (regression guard)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGraphql = vi.fn();

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({ graphql: mockGraphql }),
}));

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ userId: "sub-1", username: "user" }),
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: { idToken: { toString: () => "tok" } },
  }),
}));

beforeEach(() => vi.clearAllMocks());

describe("fetchTickets — propagates errors instead of swallowing them", () => {
  it("throws when the GraphQL call rejects (network / auth error)", async () => {
    mockGraphql.mockRejectedValue(new Error("Network error"));

    const { fetchTickets } = await import("../ticketService");
    await expect(fetchTickets("col-1")).rejects.toThrow();
  });

  it("throws when the response is a subscription object (no `data` key)", async () => {
    // AppSync can return a subscription iterator instead of query data
    mockGraphql.mockResolvedValue({ extensions: {} }); // no `data` property

    const { fetchTickets } = await import("../ticketService");
    await expect(fetchTickets("col-1")).rejects.toThrow(
      "Unexpected subscription result for a query"
    );
  });

  it("returns tickets normally on a successful fetch (regression guard)", async () => {
    const items = [
      { id: "t-1", name: "Concert", ticketsID: "col-1", owner: "sub-1",
        type: "CONCERT", timeCreated: 1000, visibility: "PRIVATE",
        createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    ];
    mockGraphql.mockResolvedValue({
      data: { ticketsByTicketsID: { items, nextToken: null } },
    });

    const { fetchTickets } = await import("../ticketService");
    const result = await fetchTickets("col-1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t-1");
  });
});
