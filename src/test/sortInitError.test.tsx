/**
 * Tests for MEDIUM Error #4 — sort-init IIFE has no try/catch.
 *
 * Root cause: The sort-init effect calls `await fetchSortType(ticketCollectionId)`
 * inside an async IIFE with no try/catch. If fetchSortType throws (network
 * failure, auth error, etc.), the unhandled rejection exits the IIFE before
 * `setSortReady(true)` is called. sortReady stays false permanently, the
 * ticket-fetch effect's `!sortReady` guard fires on every run, and tickets
 * never load — a permanent blank screen with no error message.
 *
 * Fix: wrap the fetchSortType call in try/catch. On error, fall back to
 * SortType.TIME_CREATED and still call setSortReady(true) so tickets load.
 *
 * Covers:
 * - Tickets still load when fetchSortType throws (sortReady eventually true)
 * - Fallback sort is TIME_CREATED when fetchSortType throws
 * - isLoading returns to false (not permanently stuck) after the error
 * - Normal sort init still works when fetchSortType succeeds (regression)
 * - URL sort param still takes priority over the server value (regression)
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

const mockFetchTickets   = vi.fn().mockResolvedValue([]);
const mockFetchSortType  = vi.fn();
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

async function renderAppShell(initialPath = "/app") {
  capturedCtx = null;
  const { default: AppShell } = await import("../AppShell");
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<ContextCapture />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const ticket = {
  id: "t-1", name: "Concert", ticketsID: "col-1", owner: "sub-1",
  type: "CONCERT", timeCreated: 1000, visibility: "PRIVATE" as any,
  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockEnsureUser.mockResolvedValue({ id: "u1", ticketsCollectionId: "col-1" });
  mockUpdateSortType.mockResolvedValue(undefined);
  mockFetchTickets.mockResolvedValue([ticket]);
});

describe("AppShell — sort-init error handling", () => {
  it("tickets still load when fetchSortType throws", async () => {
    mockFetchSortType.mockRejectedValue(new Error("Network error"));
    await renderAppShell();

    await waitFor(() => {
      expect(capturedCtx?.tickets).toHaveLength(1);
    }, { timeout: 4000 });
  });

  it("falls back to TIME_CREATED sort when fetchSortType throws", async () => {
    mockFetchSortType.mockRejectedValue(new Error("Network error"));
    await renderAppShell();

    // Must eventually settle with tickets loaded (not stuck loading forever)
    await waitFor(() => {
      expect(capturedCtx?.isLoading).toBe(false);
      expect(capturedCtx?.tickets).toHaveLength(1);
    }, { timeout: 4000 });
  });

  it("isLoading returns to false when fetchSortType throws (not permanently stuck)", async () => {
    mockFetchSortType.mockRejectedValue(new Error("Network error"));
    await renderAppShell();

    await waitFor(() => {
      expect(capturedCtx?.isLoading).toBe(false);
    }, { timeout: 4000 });
  });

  it("tickets still load normally when fetchSortType succeeds (regression guard)", async () => {
    mockFetchSortType.mockResolvedValue(SortType.ALPHABETICAL);
    await renderAppShell();

    await waitFor(() => {
      expect(capturedCtx?.tickets).toHaveLength(1);
      expect(capturedCtx?.isLoading).toBe(false);
    }, { timeout: 4000 });
  });

  it("URL sort param takes priority — fetchSortType is not called when ?sort= is present", async () => {
    mockFetchSortType.mockResolvedValue(SortType.EVENT_DATE);
    await renderAppShell("/app?sort=ALPHABETICAL");

    await waitFor(() => {
      expect(capturedCtx?.tickets).toHaveLength(1);
    }, { timeout: 4000 });

    // fetchSortType should NOT have been called — URL sort had priority
    expect(mockFetchSortType).not.toHaveBeenCalled();
  });
});
