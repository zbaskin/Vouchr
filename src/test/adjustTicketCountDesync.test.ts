/**
 * Tests for Error #1 — adjustTicketCount desync problem.
 *
 * addTicket and removeTicket call adjustTicketCount after the core GraphQL
 * mutation. If adjustTicketCount throws, the error propagates to the UI and
 * the user sees a failure message — even though the ticket was actually saved
 * or deleted. This can cause the user to retry and create duplicate tickets.
 *
 * Fix: wrap adjustTicketCount calls in try/catch so a count sync failure
 * never causes the core operation to appear as failed.
 *
 * Also: removeTicket accesses res.data.deleteTicket.ticketsID without null
 * checks, which can crash if the GraphQL response is partial.
 *
 * Covers:
 * - addTicket resolves (returns ticket) even when adjustTicketCount fails
 * - addTicket does NOT swallow errors from the ticket creation itself
 * - removeTicket resolves even when adjustTicketCount fails
 * - removeTicket handles null deleteTicket in response without crashing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Single controllable graphql mock shared across all service calls
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

const MOCK_TICKET = {
  id: "t-1",
  name: "Oppenheimer",
  ticketsID: "col-1",
  owner: "sub-123::testuser",
  type: "MOVIE",
  timeCreated: 1700000000,
  visibility: "PRIVATE",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Reset module cache so the client mock is fresh each test suite
});

describe("addTicket — adjustTicketCount desync", () => {
  it("resolves and returns the created ticket even when adjustTicketCount fails", async () => {
    // Call 1: createTicket mutation succeeds
    mockGraphql.mockResolvedValueOnce({ data: { createTicket: MOCK_TICKET } });
    // Call 2+: adjustTicketCount (read collection) fails
    mockGraphql.mockRejectedValue(new Error("Count sync network error"));

    const { addTicket } = await import("../ticketService");
    const result = await addTicket({
      name: "Oppenheimer",
      ticketsID: "col-1",
      type: "MOVIE" as any,
      timeCreated: 1700000000,
    } as any);

    expect(result).toMatchObject({ id: "t-1", name: "Oppenheimer" });
  });

  it("does not throw when adjustTicketCount fails after successful ticket creation", async () => {
    mockGraphql.mockResolvedValueOnce({ data: { createTicket: MOCK_TICKET } });
    mockGraphql.mockRejectedValue(new Error("Count sync failed"));

    const { addTicket } = await import("../ticketService");
    await expect(
      addTicket({ name: "Oppenheimer", ticketsID: "col-1", type: "MOVIE" as any, timeCreated: 0 } as any)
    ).resolves.not.toThrow();
  });

  it("DOES throw when the ticket creation mutation itself fails", async () => {
    mockGraphql.mockRejectedValue(new Error("Auth error — cannot create ticket"));

    const { addTicket } = await import("../ticketService");
    await expect(
      addTicket({ name: "Oppenheimer", ticketsID: "col-1", type: "MOVIE" as any, timeCreated: 0 } as any)
    ).rejects.toThrow("Auth error — cannot create ticket");
  });
});

describe("removeTicket — adjustTicketCount desync", () => {
  it("resolves without throwing when adjustTicketCount fails after successful delete", async () => {
    // Call 1: deleteTicket mutation succeeds
    mockGraphql.mockResolvedValueOnce({ data: { deleteTicket: { id: "t-1", ticketsID: "col-1" } } });
    // Call 2+: adjustTicketCount fails
    mockGraphql.mockRejectedValue(new Error("Count sync failed"));

    const { removeTicket } = await import("../ticketService");
    await expect(removeTicket("t-1")).resolves.not.toThrow();
  });

  it("resolves without throwing when deleteTicket returns null ticketsID", async () => {
    mockGraphql.mockResolvedValueOnce({ data: { deleteTicket: null } });

    const { removeTicket } = await import("../ticketService");
    await expect(removeTicket("t-1")).resolves.not.toThrow();
  });

  it("DOES throw when the delete mutation itself fails", async () => {
    mockGraphql.mockRejectedValue(new Error("Not authorized to delete"));

    const { removeTicket } = await import("../ticketService");
    await expect(removeTicket("t-1")).rejects.toThrow("Not authorized to delete");
  });
});
