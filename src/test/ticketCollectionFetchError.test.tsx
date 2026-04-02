/**
 * Tests for Medium Error #2 — TicketCollection never renders fetchError or retry button.
 *
 * Root cause: `AppShell` built the `fetchError` / `onRetryFetch` infrastructure and
 * passes both through the outlet context, but `TicketCollection` only destructured
 * tickets/isLoading/isMobile — so errors were silently discarded and users saw a
 * blank "No tickets available" message with no explanation or way to recover.
 *
 * Fix:
 * - Destructure `fetchError` and `onRetryFetch` from the outlet context.
 * - When `fetchError` is set, render an error banner with the message and a "Retry"
 *   button that calls `onRetryFetch`.
 *
 * Covers:
 * - Error banner is visible when fetchError is non-null
 * - Retry button appears alongside the error
 * - Clicking Retry invokes onRetryFetch
 * - No error banner when fetchError is null (happy path)
 * - Error banner coexists with any already-loaded tickets (preserves collection)
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes, Outlet } from "react-router-dom";
import React from "react";
import TicketCollection from "../components/TicketCollection";
import type { AppOutletContext } from "../AppShell";
import type { Ticket } from "../API";

const makeTicket = (id: string, name: string): Ticket => ({
  id,
  name,
  ticketsID: "col-1",
  owner: "sub-1",
  type: "CONCERT",
  timeCreated: 1000,
  visibility: "PRIVATE" as any,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
} as Ticket);

function TestHarness({
  fetchError,
  onRetryFetch,
  tickets = [],
}: {
  fetchError: string | null;
  onRetryFetch: () => void;
  tickets?: Ticket[];
}) {
  const ctx: AppOutletContext = {
    tickets,
    isLoading: false,
    isMobile: false,
    ticketCollection: "col-1",
    fetchError,
    onRetryFetch,
    handleAddTicket: vi.fn(),
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn(),
    onChangeSort: vi.fn(),
  };
  return <Outlet context={ctx} />;
}

function renderCollection(opts: {
  fetchError: string | null;
  onRetryFetch?: () => void;
  tickets?: Ticket[];
}) {
  const onRetryFetch = opts.onRetryFetch ?? vi.fn();
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          element={
            <TestHarness
              fetchError={opts.fetchError}
              onRetryFetch={onRetryFetch}
              tickets={opts.tickets}
            />
          }
        >
          <Route path="/" element={<TicketCollection />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  return { onRetryFetch };
}

describe("TicketCollection — fetchError banner", () => {
  it("shows an error message when fetchError is set", () => {
    renderCollection({ fetchError: "Failed to load tickets. Please try again." });
    expect(screen.getByText(/Failed to load tickets/i)).toBeInTheDocument();
  });

  it("shows a Retry button when fetchError is set", () => {
    renderCollection({ fetchError: "Failed to load tickets. Please try again." });
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("clicking the Retry button calls onRetryFetch", () => {
    const { onRetryFetch } = renderCollection({
      fetchError: "Failed to load tickets. Please try again.",
    });
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetryFetch).toHaveBeenCalledTimes(1);
  });

  it("does not show an error banner when fetchError is null", () => {
    renderCollection({ fetchError: null, tickets: [makeTicket("t-1", "Concert")] });
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("shows error banner alongside already-loaded tickets (preserved collection)", () => {
    renderCollection({
      fetchError: "Failed to load tickets. Please try again.",
      tickets: [makeTicket("t-1", "Concert")],
    });
    // Error is shown…
    expect(screen.getByText(/Failed to load tickets/i)).toBeInTheDocument();
    // …AND existing tickets remain visible
    expect(screen.getByText("Concert")).toBeInTheDocument();
  });
});
