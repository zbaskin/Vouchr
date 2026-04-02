/**
 * Tests for Medium Error #4 — handleAddTicket silently drops the ticket when
 * ticketCollectionId is undefined.
 *
 * Root cause: `handleAddTicket` guards with `if (!newTicket.name || !ticketCollectionId) return;`
 * When `ticketCollectionId` is undefined (e.g. bootstrap is still in flight, or the
 * bootstrap failed), calling `handleAddTicket` returns `undefined` with no error thrown.
 * The caller (TicketForm) awaits the promise and receives no feedback — the ticket is
 * silently lost and the user has no idea why nothing happened.
 *
 * Fix:
 * - Separate the two guards: missing `name` is a caller error (return quietly),
 *   missing `ticketCollectionId` is an infrastructure error that must propagate.
 * - When `ticketCollectionId` is undefined, throw an Error so TicketForm's catch
 *   block can surface a user-visible message.
 *
 * Covers:
 * - Rejects with an error when ticketCollectionId is not yet available
 * - The rejection message is user-readable
 * - Still resolves successfully when ticketCollectionId IS set (regression guard)
 */

import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import React from "react";
import type { AppOutletContext } from "../AppShell";
import type { CreateTicketInput } from "../API";

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(() => ({
    authStatus: "authenticated",
    user: { userId: "sub-1", username: "testuser" },
  })),
}));

vi.mock("@aws-amplify/ui-react/styles.css", () => ({}));
vi.mock("aws-amplify/auth", () => ({ signOut: vi.fn() }));

const mockFetchTickets   = vi.fn().mockResolvedValue([]);
const mockFetchSortType  = vi.fn().mockResolvedValue(null);
const mockEnsureUser     = vi.fn();
const mockUpdateSortType = vi.fn().mockResolvedValue(undefined);
const mockAddTicket      = vi.fn();

vi.mock("../ticketService", () => ({
  fetchTickets:         (...a: any[]) => mockFetchTickets(...a),
  fetchSortType:        (...a: any[]) => mockFetchSortType(...a),
  ensureUser:           (...a: any[]) => mockEnsureUser(...a),
  updateSortType:       (...a: any[]) => mockUpdateSortType(...a),
  fetchUser:            vi.fn().mockResolvedValue(null),
  createCollection:     vi.fn().mockResolvedValue("col-new"),
  linkUserToCollection: vi.fn().mockResolvedValue(undefined),
  addTicket:            (...a: any[]) => mockAddTicket(...a),
  removeTicket:         vi.fn(),
  editTicket:           vi.fn(),
  filterTicketItems:    vi.fn((items: any[]) => (items ?? []).filter(Boolean)),
}));

let capturedCtx: AppOutletContext | null = null;

function ContextCapture() {
  capturedCtx = useOutletContext<AppOutletContext>();
  return <div data-testid="child" />;
}

async function renderAppShell() {
  capturedCtx = null;
  const { default: AppShell } = await import("../AppShell");
  render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<ContextCapture />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const newTicket: CreateTicketInput = {
  name: "Concert",
  ticketsID: "",
  type: "CONCERT",
  timeCreated: 1000,
  visibility: "PRIVATE" as any,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSortType.mockResolvedValue(null);
  mockFetchTickets.mockResolvedValue([]);
  mockUpdateSortType.mockResolvedValue(undefined);
});

describe("AppShell — handleAddTicket with missing ticketCollectionId", () => {
  it("rejects with an error when ticketCollectionId is not yet available", async () => {
    // ensureUser returns null → ticketCollectionId never set → context.ticketCollection is undefined
    mockEnsureUser.mockResolvedValue(null);
    await renderAppShell();

    await waitFor(() => expect(capturedCtx).not.toBeNull(), { timeout: 3000 });

    // handleAddTicket must REJECT — not silently return
    await expect(capturedCtx!.handleAddTicket(newTicket)).rejects.toThrow();
  });

  it("rejects with a user-readable message when ticketCollectionId is missing", async () => {
    mockEnsureUser.mockResolvedValue(null);
    await renderAppShell();

    await waitFor(() => expect(capturedCtx).not.toBeNull(), { timeout: 3000 });

    let errorMessage = "";
    try {
      await capturedCtx!.handleAddTicket(newTicket);
    } catch (e: any) {
      errorMessage = e?.message ?? "";
    }
    expect(errorMessage.length).toBeGreaterThan(0);
  });

  it("resolves successfully when ticketCollectionId is set (regression guard)", async () => {
    mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
    mockAddTicket.mockResolvedValue({ ...newTicket, id: "t-new", ticketsID: "col-1" });

    await renderAppShell();

    await waitFor(() => expect(capturedCtx?.ticketCollection).toBe("col-1"), { timeout: 3000 });

    await expect(
      capturedCtx!.handleAddTicket({ ...newTicket, ticketsID: "col-1" })
    ).resolves.toBeUndefined();
  });
});
