/**
 * Tests for Medium Error #3 — bootstrap IIFE has no error handling.
 *
 * Root cause: The one-time bootstrap effect (ensureUser + createCollection) sets
 * `bootRef.current = true` before the async work begins and has no try/catch.
 * If `ensureUser` or `createCollection` throw, the error propagates silently,
 * `bootRef.current` stays `true`, and the effect can never run again — leaving
 * the user on a permanently blank screen with no error message and no way to retry.
 *
 * Fix:
 * - Wrap the async IIFE in try/catch.
 * - On catch: reset `bootRef.current = false` (so a retry is possible) and set a
 *   `bootError` string state.
 * - In the render path: when `bootError` is set, display an error message and a
 *   "Retry" button that clears `bootError` and re-runs the effect via a counter state.
 *
 * Covers:
 * - Shows an error message when ensureUser throws
 * - Shows a Retry button alongside the error
 * - Clicking Retry re-attempts the bootstrap and clears the error on success
 * - Clicking Retry re-attempts when ensureUser keeps failing (error stays visible)
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

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

function ChildPlaceholder() {
  return <div data-testid="child" />;
}

async function renderAppShell() {
  const { default: AppShell } = await import("../AppShell");
  render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<ChildPlaceholder />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSortType.mockResolvedValue(null);
  mockFetchTickets.mockResolvedValue([]);
  mockUpdateSortType.mockResolvedValue(undefined);
});

describe("AppShell — bootstrap error handling", () => {
  it("shows an error message when ensureUser throws", async () => {
    mockEnsureUser.mockRejectedValue(new Error("Database unavailable"));
    await renderAppShell();

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows a Retry button when bootstrap fails", async () => {
    mockEnsureUser.mockRejectedValue(new Error("Database unavailable"));
    await renderAppShell();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("clears error and loads app when Retry succeeds", async () => {
    mockEnsureUser
      .mockRejectedValueOnce(new Error("Database unavailable"))
      .mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });

    await renderAppShell();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    // After successful retry, error message should disappear
    await waitFor(() => {
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("keeps error visible when Retry also fails", async () => {
    mockEnsureUser.mockRejectedValue(new Error("Persistent failure"));
    await renderAppShell();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
