/**
 * Regression test: addTicket() must forward rating and notes into the
 * GraphQL mutation variables. The function manually enumerates fields, so
 * new fields must be explicitly added — this test catches the omission.
 *
 * Covers:
 * - rating is included in createTicket mutation variables
 * - notes is included in createTicket mutation variables
 * - null rating is forwarded (not silently dropped)
 * - null notes is forwarded (not silently dropped)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventType, Visibility } from "../API";

const { mockGraphql } = vi.hoisted(() => ({ mockGraphql: vi.fn() }));

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({ graphql: mockGraphql }),
}));

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ userId: "user-sub-123" }),
  fetchAuthSession: vi.fn().mockResolvedValue({ tokens: { accessToken: "tok" } }),
}));

// adjustTicketCount calls graphql too — let all calls succeed generically
beforeEach(() => {
  mockGraphql.mockClear();
  mockGraphql.mockResolvedValue({
    data: {
      createTicket: {
        id: "new-ticket-id",
        ticketsID: "col-1",
        name: "Test",
        type: EventType.MOVIE,
        visibility: Visibility.PRIVATE,
        timeCreated: 123,
        owner: "user-sub-123",
        rating: 4,
        notes: "Great film.",
        createdAt: "",
        updatedAt: "",
        __typename: "Ticket",
      },
      updateTicketCollection: { id: "col-1", ticketCount: 1 },
    },
  });
});

import { addTicket } from "../ticketService";

const BASE_INPUT = {
  owner: "user-sub-123",
  name: "Test Movie",
  type: EventType.MOVIE,
  ticketsID: "col-1",
  timeCreated: 123,
  visibility: Visibility.PRIVATE,
};

describe("addTicket — field forwarding", () => {
  it("includes rating in the createTicket mutation variables", async () => {
    await addTicket({ ...BASE_INPUT, rating: 4 });

    const createCall = mockGraphql.mock.calls.find(
      (call) => JSON.stringify(call[0].query).includes("createTicket")
    );
    expect(createCall).toBeDefined();
    expect(createCall![0].variables.input.rating).toBe(4);
  });

  it("includes notes in the createTicket mutation variables", async () => {
    await addTicket({ ...BASE_INPUT, notes: "Great film." });

    const createCall = mockGraphql.mock.calls.find(
      (call) => JSON.stringify(call[0].query).includes("createTicket")
    );
    expect(createCall![0].variables.input.notes).toBe("Great film.");
  });

  it("forwards null rating (does not drop it)", async () => {
    await addTicket({ ...BASE_INPUT, rating: null });

    const createCall = mockGraphql.mock.calls.find(
      (call) => JSON.stringify(call[0].query).includes("createTicket")
    );
    expect(createCall![0].variables.input).toHaveProperty("rating", null);
  });

  it("forwards null notes (does not drop it)", async () => {
    await addTicket({ ...BASE_INPUT, notes: null });

    const createCall = mockGraphql.mock.calls.find(
      (call) => JSON.stringify(call[0].query).includes("createTicket")
    );
    expect(createCall![0].variables.input).toHaveProperty("notes", null);
  });
});
