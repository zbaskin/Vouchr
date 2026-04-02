/**
 * Tests for HIGH Error #1 — optimistic edit spread corrupts ticket state.
 *
 * Root cause: handleEditTicket falls back to an in-place optimistic update when
 * fetchTickets fails after a successful editTicket mutation. The spread used is
 * `{ ...t, ...u }` where `u` is the edit payload (7 fields: id, name, venue,
 * eventDate, eventTime, theater, seat).
 *
 * Two problems:
 * 1. eventTime normalization gap — editTicket() is called with eventTime padded
 *    to HH:MM:SS (line 243: `u.eventTime.length === 5 ? "${u.eventTime}:00" : u.eventTime`).
 *    The optimistic spread uses u.eventTime raw, so after a refresh failure the
 *    in-state ticket has "21:00" while the server has "21:00:00". This breaks
 *    sortTickets EVENT_DATE comparisons and any display that splits on ":".
 *
 * 2. Implicit spread is fragile — if the edit payload type ever gains a new field
 *    it would silently overlay Ticket fields. Being explicit about which fields
 *    change is safer.
 *
 * Fix:
 * - Replace `{ ...t, ...u }` with explicit field projection that mirrors the
 *   normalization already applied in the editTicket() call:
 *     { ...t, name, venue, eventDate, eventTime: normalized, theater, seat }
 *
 * Covers:
 * - eventTime "HH:MM" is normalized to "HH:MM:SS" in the optimistic update
 * - eventTime already in "HH:MM:SS" is preserved unchanged
 * - Edited fields (name, venue, eventDate, theater, seat) are updated in state
 * - Non-edited fields (timeCreated, type, ticketsID, owner, visibility) are preserved
 * - Un-edited tickets in the collection are untouched
 */

import { render, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import React from "react";
import type { AppOutletContext } from "../AppShell";
import type { Ticket } from "../API";

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(() => ({
    authStatus: "authenticated",
    user: { userId: "sub-1", username: "testuser" },
  })),
}));

vi.mock("@aws-amplify/ui-react/styles.css", () => ({}));
vi.mock("aws-amplify/auth", () => ({ signOut: vi.fn() }));

const mockFetchTickets   = vi.fn();
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

// A full Ticket with all fields populated — any spread that drops fields will
// be detectable because the non-edit fields would become undefined.
const originalTicket: Ticket = {
  id: "t-1",
  name: "Original Name",
  venue: "Original Venue",
  eventDate: "2024-06-15",
  eventTime: "20:00:00",
  theater: "Hall A",
  seat: "Row 1",
  ticketsID: "col-1",
  owner: "sub-1",
  type: "CONCERT",
  timeCreated: 999_999,
  visibility: "PRIVATE" as any,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const otherTicket: Ticket = {
  id: "t-2",
  name: "Other Ticket",
  venue: "Other Venue",
  eventDate: "2024-07-01",
  eventTime: "19:00:00",
  theater: "Hall B",
  seat: "Row 2",
  ticketsID: "col-1",
  owner: "sub-1",
  type: "SPORTS",
  timeCreated: 888_888,
  visibility: "PRIVATE" as any,
  createdAt: "2024-01-02T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
};

// Simulate: initial load succeeds, then refresh after edit fails → optimistic path
async function setupWithOptimisticFallback() {
  // First fetchTickets call (initial load) succeeds
  mockFetchTickets
    .mockResolvedValueOnce([originalTicket, otherTicket])
    // Second call (after editTicket) fails → triggers optimistic in-place update
    .mockRejectedValue(new Error("Network error"));

  await renderAppShell();
  await waitFor(() => expect(capturedCtx?.tickets).toHaveLength(2), { timeout: 3000 });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSortType.mockResolvedValue(null);
  mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
  mockUpdateSortType.mockResolvedValue(undefined);
  mockEditTicket.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------

describe("handleEditTicket — optimistic in-place update", () => {
  it("normalizes HH:MM eventTime to HH:MM:SS in the optimistic update", async () => {
    await setupWithOptimisticFallback();

    await act(async () => {
      await capturedCtx!.handleEditTicket({
        id: "t-1",
        name: "Updated Name",
        venue: "Updated Venue",
        eventDate: "2024-06-15",
        eventTime: "21:00",    // <-- HH:MM (5 chars) — must be padded
        theater: "Hall A",
        seat: "Row 1",
      });
    });

    await waitFor(() => {
      const updated = (capturedCtx!.tickets as Ticket[]).find(t => t.id === "t-1");
      expect(updated?.eventTime).toBe("21:00:00");
    }, { timeout: 3000 });
  });

  it("preserves HH:MM:SS eventTime that is already normalized", async () => {
    await setupWithOptimisticFallback();

    await act(async () => {
      await capturedCtx!.handleEditTicket({
        id: "t-1",
        name: "Updated Name",
        venue: "Updated Venue",
        eventDate: "2024-06-15",
        eventTime: "21:00:00",  // already 8 chars
        theater: "Hall A",
        seat: "Row 1",
      });
    });

    await waitFor(() => {
      const updated = (capturedCtx!.tickets as Ticket[]).find(t => t.id === "t-1");
      expect(updated?.eventTime).toBe("21:00:00");
    }, { timeout: 3000 });
  });

  it("updates the edited fields in state", async () => {
    await setupWithOptimisticFallback();

    await act(async () => {
      await capturedCtx!.handleEditTicket({
        id: "t-1",
        name: "New Concert Name",
        venue: "New Venue",
        eventDate: "2024-12-31",
        eventTime: "22:30",
        theater: "Main Stage",
        seat: "VIP 1",
      });
    });

    await waitFor(() => {
      const updated = (capturedCtx!.tickets as Ticket[]).find(t => t.id === "t-1");
      expect(updated?.name).toBe("New Concert Name");
      expect(updated?.venue).toBe("New Venue");
      expect(updated?.eventDate).toBe("2024-12-31");
      expect(updated?.theater).toBe("Main Stage");
      expect(updated?.seat).toBe("VIP 1");
    }, { timeout: 3000 });
  });

  it("preserves non-edited fields (timeCreated, type, ticketsID, owner, visibility)", async () => {
    await setupWithOptimisticFallback();

    await act(async () => {
      await capturedCtx!.handleEditTicket({
        id: "t-1",
        name: "Updated Name",
        venue: "Updated Venue",
        eventDate: "2024-06-15",
        eventTime: "21:00",
        theater: "Hall A",
        seat: "Row 1",
      });
    });

    await waitFor(() => {
      const updated = (capturedCtx!.tickets as Ticket[]).find(t => t.id === "t-1");
      expect(updated?.timeCreated).toBe(originalTicket.timeCreated);
      expect(updated?.type).toBe(originalTicket.type);
      expect(updated?.ticketsID).toBe(originalTicket.ticketsID);
      expect(updated?.owner).toBe(originalTicket.owner);
      expect(updated?.visibility).toBe(originalTicket.visibility);
    }, { timeout: 3000 });
  });

  it("does not modify other tickets in the collection", async () => {
    await setupWithOptimisticFallback();

    await act(async () => {
      await capturedCtx!.handleEditTicket({
        id: "t-1",
        name: "Updated Name",
        venue: "Updated Venue",
        eventDate: "2024-06-15",
        eventTime: "21:00",
        theater: "Hall A",
        seat: "Row 1",
      });
    });

    await waitFor(() => {
      const unchanged = (capturedCtx!.tickets as Ticket[]).find(t => t.id === "t-2");
      expect(unchanged?.name).toBe(otherTicket.name);
      expect(unchanged?.timeCreated).toBe(otherTicket.timeCreated);
    }, { timeout: 3000 });
  });
});
