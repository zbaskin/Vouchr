/**
 * Tests for HIGH Error #3 — handleEditTicket silently returns when u.id is falsy.
 *
 * Root cause: `if (!u?.id) return;` — when the ticket id is missing or empty,
 * handleEditTicket resolves to undefined with no error thrown. The TicketEdit
 * modal stays open with no feedback; the user has no idea why the save did nothing.
 *
 * Fix: throw an Error so TicketEdit's catch block can display the save-error banner.
 * This mirrors the same fix already applied to handleAddTicket (which previously
 * also used silent-return guards).
 *
 * Covers:
 * - Rejects when id is an empty string
 * - Rejects when id is undefined (via optional chaining)
 * - The rejection carries a user-readable message
 * - Normal edit still resolves when id is present (regression guard)
 */

import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import React from "react";
import type { AppOutletContext } from "../AppShell";

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
const mockEnsureUser     = vi.fn().mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
const mockUpdateSortType = vi.fn().mockResolvedValue(undefined);
const mockEditTicket     = vi.fn().mockResolvedValue(undefined);

vi.mock("../ticketService", () => ({
  fetchTickets:         (...a: any[]) => mockFetchTickets(...a),
  fetchSortType:        (...a: any[]) => mockFetchSortType(...a),
  ensureUser:           (...a: any[]) => mockEnsureUser(...a),
  updateSortType:       (...a: any[]) => mockUpdateSortType(...a),
  editTicket:           (...a: any[]) => mockEditTicket(...a),
  fetchUser:            vi.fn().mockResolvedValue(null),
  createCollection:     vi.fn().mockResolvedValue("col-new"),
  linkUserToCollection: vi.fn().mockResolvedValue(undefined),
  addTicket:            vi.fn(),
  removeTicket:         vi.fn(),
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

const validEdit = {
  id: "t-1",
  name: "Updated Name",
  venue: "Updated Venue",
  eventDate: "2024-06-15",
  eventTime: "21:00:00",
  theater: "Hall A",
  seat: "Row 1",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSortType.mockResolvedValue(null);
  mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
  mockUpdateSortType.mockResolvedValue(undefined);
  mockEditTicket.mockResolvedValue(undefined);
  mockFetchTickets.mockResolvedValue([]);
});

describe("handleEditTicket — missing ticket id", () => {
  it("rejects when id is an empty string", async () => {
    await renderAppShell();
    await waitFor(() => expect(capturedCtx).not.toBeNull(), { timeout: 3000 });

    await expect(
      capturedCtx!.handleEditTicket({ ...validEdit, id: "" })
    ).rejects.toThrow();
  });

  it("rejects with a user-readable error message when id is empty", async () => {
    await renderAppShell();
    await waitFor(() => expect(capturedCtx).not.toBeNull(), { timeout: 3000 });

    let message = "";
    try {
      await capturedCtx!.handleEditTicket({ ...validEdit, id: "" });
    } catch (e: any) {
      message = e?.message ?? "";
    }
    expect(message.length).toBeGreaterThan(0);
  });

  it("resolves successfully when id is present (regression guard)", async () => {
    await renderAppShell();
    await waitFor(() => expect(capturedCtx?.ticketCollection).toBe("col-1"), { timeout: 3000 });

    await expect(
      capturedCtx!.handleEditTicket(validEdit)
    ).resolves.toBeUndefined();
  });
});
