/**
 * Tests for Medium Error #1 — sort change triggers a redundant network re-fetch.
 *
 * Root cause: `sortType` was in the fetch-effect dependency array. When the user
 * changed the sort preference, `setSortType` fired, which caused the entire fetch
 * effect to re-run and hit the network again — even though all the tickets were
 * already in memory and only needed reordering.
 *
 * Fix:
 * - Remove `sortType` from the fetch-effect dependency array (the effect still reads
 *   `sortType` via closure for the initial load; the stale-closure risk is acceptable
 *   here because sort is only set once during init before the first fetch).
 * - In `handleChangeSort`, immediately apply `sortTickets(prev, next)` to the
 *   in-memory collection so the UI updates without a network round-trip.
 *
 * Covers:
 * - Changing sort does NOT trigger a second call to fetchTickets
 * - After sort change, tickets are re-ordered in memory (not wiped then re-fetched)
 * - Multiple sequential sort changes only produce one initial fetch
 */

import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import React from "react";
import type { AppOutletContext } from "../AppShell";
import { SortType } from "../API";

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

vi.mock("../ticketService", () => ({
  fetchTickets:         (...a: any[]) => mockFetchTickets(...a),
  fetchSortType:        (...a: any[]) => mockFetchSortType(...a),
  ensureUser:           (...a: any[]) => mockEnsureUser(...a),
  updateSortType:       (...a: any[]) => mockUpdateSortType(...a),
  fetchUser:            vi.fn().mockResolvedValue(null),
  createCollection:     vi.fn().mockResolvedValue("col-new"),
  linkUserToCollection: vi.fn().mockResolvedValue(undefined),
  addTicket:            vi.fn(),
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

const makeTicket = (id: string, name: string, timeCreated = 1000) => ({
  id,
  name,
  ticketsID: "col-1",
  owner: "sub-1",
  type: "CONCERT",
  timeCreated,
  visibility: "PRIVATE" as any,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSortType.mockResolvedValue(null);
  mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
  mockUpdateSortType.mockResolvedValue(undefined);
});

describe("AppShell — sort change uses in-memory re-sort, not network re-fetch", () => {
  it("does not call fetchTickets again when the sort type changes", async () => {
    const tickets = [
      makeTicket("t-1", "Zoo", 2000),
      makeTicket("t-2", "Apple", 1000),
    ];
    mockFetchTickets.mockResolvedValue(tickets);
    await renderAppShell();

    // Wait for initial load
    await waitFor(() => expect(capturedCtx?.tickets).toHaveLength(2), { timeout: 3000 });
    const callsAfterLoad = mockFetchTickets.mock.calls.length;

    // Change sort — must NOT trigger a new network call
    capturedCtx?.onChangeSort(SortType.ALPHABETICAL);

    // Wait a tick to let any effects fire
    await new Promise(r => setTimeout(r, 200));
    expect(mockFetchTickets).toHaveBeenCalledTimes(callsAfterLoad);
  });

  it("re-orders tickets in memory when switching to ALPHABETICAL sort", async () => {
    const tickets = [
      makeTicket("t-1", "Zoo", 2000),
      makeTicket("t-2", "Apple", 1000),
    ];
    mockFetchTickets.mockResolvedValue(tickets);
    await renderAppShell();

    await waitFor(() => expect(capturedCtx?.tickets).toHaveLength(2), { timeout: 3000 });

    capturedCtx?.onChangeSort(SortType.ALPHABETICAL);

    await waitFor(() => {
      expect(capturedCtx?.tickets[0].name).toBe("Apple");
      expect(capturedCtx?.tickets[1].name).toBe("Zoo");
    }, { timeout: 3000 });
  });

  it("re-orders tickets in memory when switching to TIME_CREATED sort", async () => {
    const tickets = [
      makeTicket("t-1", "Alpha", 1000),  // older
      makeTicket("t-2", "Beta",  3000),  // newer
    ];
    mockFetchTickets.mockResolvedValue(tickets);
    await renderAppShell();

    await waitFor(() => expect(capturedCtx?.tickets).toHaveLength(2), { timeout: 3000 });

    // First go ALPHABETICAL, then back to TIME_CREATED
    capturedCtx?.onChangeSort(SortType.ALPHABETICAL);
    await waitFor(() => expect(capturedCtx?.tickets[0].name).toBe("Alpha"), { timeout: 3000 });

    capturedCtx?.onChangeSort(SortType.TIME_CREATED);

    // TIME_CREATED is descending — newest first
    await waitFor(() => {
      expect(capturedCtx?.tickets[0].name).toBe("Beta");
      expect(capturedCtx?.tickets[1].name).toBe("Alpha");
    }, { timeout: 3000 });
  });

  it("makes exactly one fetch call across multiple sequential sort changes", async () => {
    mockFetchTickets.mockResolvedValue([makeTicket("t-1", "Concert")]);
    await renderAppShell();

    await waitFor(() => expect(capturedCtx?.tickets).toHaveLength(1), { timeout: 3000 });
    const callsAfterLoad = mockFetchTickets.mock.calls.length;

    capturedCtx?.onChangeSort(SortType.ALPHABETICAL);
    capturedCtx?.onChangeSort(SortType.EVENT_DATE);
    capturedCtx?.onChangeSort(SortType.TIME_CREATED);

    await new Promise(r => setTimeout(r, 200));
    expect(mockFetchTickets).toHaveBeenCalledTimes(callsAfterLoad);
  });
});
