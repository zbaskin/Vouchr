/**
 * Tests for Error #3 — fetchTickets drops tickets beyond the first AppSync page.
 *
 * AppSync/DynamoDB uses cursor-based pagination. Each response includes a
 * `nextToken` field. If non-null, more items exist on the next page.
 * The old implementation made exactly one request and discarded `nextToken`,
 * silently dropping all tickets on pages 2+.
 *
 * Fix: loop until `nextToken` is null, accumulating items across all pages.
 *
 * Covers:
 * - Single-page collection (nextToken = null): returns all items
 * - Multi-page collection (2 pages): returns combined items from both pages
 * - Empty collection: returns empty array
 * - DynamoDB short-page (items < limit but nextToken non-null): still fetches next page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGraphql = vi.fn();

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({ graphql: mockGraphql }),
}));

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ userId: "sub-123", username: "testuser" }),
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: { idToken: { toString: () => "mock-token" } },
  }),
}));

const makeTicket = (id: string) => ({
  id,
  name: `Ticket ${id}`,
  ticketsID: "col-1",
  owner: "sub-123",
  type: "MOVIE",
  timeCreated: 1700000000,
  visibility: "PRIVATE",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchTickets — pagination", () => {
  it("returns all items when collection fits in a single page (nextToken = null)", async () => {
    const items = [makeTicket("t-1"), makeTicket("t-2")];
    mockGraphql.mockResolvedValueOnce({
      data: { ticketsByTicketsID: { items, nextToken: null } },
    });

    const { fetchTickets } = await import("../ticketService");
    const result = await fetchTickets("col-1");

    expect(result).toHaveLength(2);
    expect(result.map((t: any) => t.id)).toEqual(["t-1", "t-2"]);
    expect(mockGraphql).toHaveBeenCalledTimes(1);
  });

  it("fetches all pages when nextToken is present (2 pages)", async () => {
    const page1 = [makeTicket("t-1"), makeTicket("t-2")];
    const page2 = [makeTicket("t-3"), makeTicket("t-4")];

    mockGraphql
      .mockResolvedValueOnce({
        data: { ticketsByTicketsID: { items: page1, nextToken: "cursor-abc" } },
      })
      .mockResolvedValueOnce({
        data: { ticketsByTicketsID: { items: page2, nextToken: null } },
      });

    const { fetchTickets } = await import("../ticketService");
    const result = await fetchTickets("col-1");

    expect(result).toHaveLength(4);
    expect(result.map((t: any) => t.id)).toEqual(["t-1", "t-2", "t-3", "t-4"]);
    expect(mockGraphql).toHaveBeenCalledTimes(2);
  });

  it("passes nextToken to the second request", async () => {
    const page1 = [makeTicket("t-1")];
    const page2 = [makeTicket("t-2")];

    mockGraphql
      .mockResolvedValueOnce({
        data: { ticketsByTicketsID: { items: page1, nextToken: "cursor-xyz" } },
      })
      .mockResolvedValueOnce({
        data: { ticketsByTicketsID: { items: page2, nextToken: null } },
      });

    const { fetchTickets } = await import("../ticketService");
    await fetchTickets("col-1");

    const secondCallVars = mockGraphql.mock.calls[1][0].variables;
    expect(secondCallVars.nextToken).toBe("cursor-xyz");
  });

  it("returns empty array for an empty collection", async () => {
    mockGraphql.mockResolvedValueOnce({
      data: { ticketsByTicketsID: { items: [], nextToken: null } },
    });

    const { fetchTickets } = await import("../ticketService");
    const result = await fetchTickets("col-1");

    expect(result).toHaveLength(0);
    expect(mockGraphql).toHaveBeenCalledTimes(1);
  });

  it("fetches next page even when DynamoDB returns fewer items than the limit", async () => {
    // DynamoDB can return a short page (e.g., due to filter expressions) with
    // a non-null nextToken. Only nextToken===null signals end-of-data.
    const page1 = [makeTicket("t-1")]; // only 1 item even though limit=100
    const page2 = [makeTicket("t-2"), makeTicket("t-3")];

    mockGraphql
      .mockResolvedValueOnce({
        data: { ticketsByTicketsID: { items: page1, nextToken: "cursor-short" } },
      })
      .mockResolvedValueOnce({
        data: { ticketsByTicketsID: { items: page2, nextToken: null } },
      });

    const { fetchTickets } = await import("../ticketService");
    const result = await fetchTickets("col-1");

    expect(result).toHaveLength(3);
    expect(mockGraphql).toHaveBeenCalledTimes(2);
  });

  it("filters out null items within pages", async () => {
    mockGraphql.mockResolvedValueOnce({
      data: {
        ticketsByTicketsID: {
          items: [makeTicket("t-1"), null, makeTicket("t-2"), undefined],
          nextToken: null,
        },
      },
    });

    const { fetchTickets } = await import("../ticketService");
    const result = await fetchTickets("col-1");

    expect(result).toHaveLength(2);
  });
});
