/**
 * Tests for Error #1 — Tickets never load when sort preference resolves to TIME_CREATED.
 *
 * Root cause:
 *   sortType state initialises to SortType.TIME_CREATED.
 *   The sort-init effect resolves the preference (URL or server) and calls
 *   setSortType(effective). When effective === TIME_CREATED, React deduplicates
 *   the setState call (same value) so sortType never changes. The ticket-fetch
 *   effect depends on [authReady, ticketCollectionId, sortType], none of which
 *   changed, so it never re-runs.
 *   The init completion was tracked via initializedSortRef (a useRef), but refs
 *   do not appear in dependency arrays and do not trigger re-renders.
 *
 * Fix:
 *   Replace initializedSortRef with a sortReady state variable.
 *   setSortReady(true) fires a state update that causes a re-render, which causes
 *   the ticket-fetch effect to re-run and see sortReady===true → fetch succeeds.
 *
 * Covers:
 * - fetchTickets IS called when server sort preference is null (→ TIME_CREATED default)
 * - fetchTickets IS called when URL contains ?sort=TIME_CREATED
 * - fetchTickets IS called when server sort preference is a non-default value (ALPHABETICAL)
 * - fetchTickets is called with the correct collectionId
 */

import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

// --- mocks -------------------------------------------------------------------

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(() => ({
    authStatus: "authenticated",
    user: { userId: "sub-1", username: "testuser" },
  })),
}));

// CSS import in AppShell — safe to ignore in test environment
vi.mock("@aws-amplify/ui-react/styles.css", () => ({}));

vi.mock("aws-amplify/auth", () => ({
  signOut: vi.fn(),
}));

const mockFetchTickets    = vi.fn().mockResolvedValue([]);
const mockFetchSortType   = vi.fn().mockResolvedValue(null); // null → TIME_CREATED
const mockEnsureUser      = vi.fn().mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
const mockUpdateSortType  = vi.fn().mockResolvedValue(undefined);
const mockFetchUser       = vi.fn().mockResolvedValue(null);
const mockCreateCollection = vi.fn().mockResolvedValue("col-new");
const mockLinkUserToCollection = vi.fn().mockResolvedValue(undefined);

vi.mock("../ticketService", () => ({
  fetchTickets:          (...args: any[]) => mockFetchTickets(...args),
  fetchSortType:         (...args: any[]) => mockFetchSortType(...args),
  ensureUser:            (...args: any[]) => mockEnsureUser(...args),
  updateSortType:        (...args: any[]) => mockUpdateSortType(...args),
  fetchUser:             (...args: any[]) => mockFetchUser(...args),
  createCollection:      (...args: any[]) => mockCreateCollection(...args),
  linkUserToCollection:  (...args: any[]) => mockLinkUserToCollection(...args),
  addTicket:             vi.fn(),
  removeTicket:          vi.fn(),
  editTicket:            vi.fn(),
  filterTicketItems:     vi.fn((items: any[]) => (items ?? []).filter(Boolean)),
}));

// --- helpers -----------------------------------------------------------------

async function renderAppShell(initialUrl = "/app") {
  const { default: AppShell } = await import("../AppShell");
  render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<div data-testid="child" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Re-apply default mock implementations after clearAllMocks
  mockFetchSortType.mockResolvedValue(null);
  mockFetchTickets.mockResolvedValue([]);
  mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
  mockUpdateSortType.mockResolvedValue(undefined);
});

// -----------------------------------------------------------------------------

describe("AppShell — tickets load when sort resolves to TIME_CREATED", () => {
  it("calls fetchTickets when server sort preference is null (defaults to TIME_CREATED)", async () => {
    mockFetchSortType.mockResolvedValue(null); // → TIME_CREATED
    await renderAppShell();

    await waitFor(() => expect(mockFetchTickets).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(mockFetchTickets).toHaveBeenCalledWith("col-1");
  });

  it("calls fetchTickets when URL already contains ?sort=TIME_CREATED", async () => {
    await renderAppShell("/app?sort=TIME_CREATED");

    await waitFor(() => expect(mockFetchTickets).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(mockFetchTickets).toHaveBeenCalledWith("col-1");
  });

  it("calls fetchTickets when server returns a non-default sort (ALPHABETICAL)", async () => {
    mockFetchSortType.mockResolvedValue("ALPHABETICAL");
    await renderAppShell();

    await waitFor(() => expect(mockFetchTickets).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(mockFetchTickets).toHaveBeenCalledWith("col-1");
  });

  it("calls fetchTickets with the correct collectionId from ensureUser", async () => {
    mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "my-collection-id" });
    await renderAppShell();

    await waitFor(() => expect(mockFetchTickets).toHaveBeenCalledWith("my-collection-id"), { timeout: 3000 });
  });
});
