/**
 * Tests for Error #2 (part 2 of 2) — AppShell silently wipes tickets on fetch failure.
 *
 * Root cause: fetchTickets swallowed its error and returned []. AppShell called
 * setTickets([]) unconditionally, replacing any previously loaded collection with
 * nothing. Users saw "No tickets available" with no error message and no retry.
 *
 * Fix:
 * - fetchTickets now throws on error (see fetchTicketsError.test.ts)
 * - AppShell ticket-fetch effect catches the error, preserves existing tickets,
 *   sets a fetchError message, and exposes an onRetryFetch callback through the
 *   outlet context so the child route can render a retry button.
 *
 * Covers:
 * - On initial fetch failure, fetchError is set in outlet context
 * - On initial fetch failure, existing tickets are NOT wiped (empty initial = stays empty,
 *   but a subsequent failure after tickets were loaded keeps them)
 * - onRetryFetch triggers a new fetch attempt
 * - A successful retry clears fetchError
 * - isLoading returns to false after a fetch error (not stuck on "Loading...")
 */

import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import React from "react";
import type { AppOutletContext } from "../AppShell";

// --- mocks (same pattern as appShellTicketLoad.test.tsx) --------------------

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

// --- child component that reads the outlet context --------------------------

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

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSortType.mockResolvedValue(null);
  mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
  mockUpdateSortType.mockResolvedValue(undefined);
});

// ----------------------------------------------------------------------------

describe("AppShell — fetch error handling", () => {
  it("exposes fetchError in outlet context when fetchTickets throws", async () => {
    mockFetchTickets.mockRejectedValue(new Error("Network error"));
    await renderAppShell();

    await waitFor(() => expect(capturedCtx?.fetchError).toBeTruthy(), { timeout: 3000 });
  });

  it("sets isLoading to false after a fetch error (not stuck loading)", async () => {
    mockFetchTickets.mockRejectedValue(new Error("Network error"));
    await renderAppShell();

    await waitFor(() => {
      expect(capturedCtx?.fetchError).toBeTruthy();
      expect(capturedCtx?.isLoading).toBe(false);
    }, { timeout: 3000 });
  });

  it("preserves existing tickets when a refresh fetch fails", async () => {
    // First call succeeds with one ticket, second call fails
    const ticket = { id: "t-1", name: "Concert", ticketsID: "col-1", owner: "sub-1",
      type: "CONCERT", timeCreated: 1000, visibility: "PRIVATE",
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" };
    mockFetchTickets
      .mockResolvedValueOnce([ticket])
      .mockRejectedValue(new Error("Network error"));

    await renderAppShell();

    // Wait for initial load
    await waitFor(() => expect(capturedCtx?.tickets).toHaveLength(1), { timeout: 3000 });

    // Trigger a retry that fails
    capturedCtx?.onRetryFetch();

    await waitFor(() => expect(capturedCtx?.fetchError).toBeTruthy(), { timeout: 3000 });

    // Tickets must NOT be wiped
    expect(capturedCtx?.tickets).toHaveLength(1);
  });

  it("exposes onRetryFetch callback in outlet context", async () => {
    mockFetchTickets.mockRejectedValue(new Error("Network error"));
    await renderAppShell();

    await waitFor(() => expect(capturedCtx?.fetchError).toBeTruthy(), { timeout: 3000 });
    expect(typeof capturedCtx?.onRetryFetch).toBe("function");
  });

  it("clears fetchError and loads tickets on a successful retry", async () => {
    const ticket = { id: "t-1", name: "Concert", ticketsID: "col-1", owner: "sub-1",
      type: "CONCERT", timeCreated: 1000, visibility: "PRIVATE",
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" };

    mockFetchTickets
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue([ticket]);

    await renderAppShell();

    // Wait for initial failure
    await waitFor(() => expect(capturedCtx?.fetchError).toBeTruthy(), { timeout: 3000 });

    // Retry
    capturedCtx?.onRetryFetch();

    // Error should clear and ticket should appear
    await waitFor(() => {
      expect(capturedCtx?.fetchError).toBeNull();
      expect(capturedCtx?.tickets).toHaveLength(1);
    }, { timeout: 3000 });
  });
});
