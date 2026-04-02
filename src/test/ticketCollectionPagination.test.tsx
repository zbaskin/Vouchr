/**
 * Tests for Error #4 — viewport resize across 500px breakpoint doesn't reset page.
 *
 * Root cause: TICKETS_PER_PAGE is derived from isMobile on every render (8 mobile,
 * 15 desktop), but page is only reset when tickets.length changes. If the user is
 * on page 2 desktop and the viewport narrows to mobile, TICKETS_PER_PAGE drops from
 * 15 to 8 but page stays at 2, showing the wrong slice. Worse, if page exceeds the
 * new totalPages (e.g. on page 4 desktop → mobile with fewer pages), an empty view
 * is shown even though tickets exist on page 1.
 *
 * Fix: add isMobile to the useEffect dependency array so page resets to 1 whenever
 * the breakpoint changes.
 *
 * Covers:
 * - Switching from desktop to mobile resets page to 1
 * - Switching from mobile to desktop resets page to 1
 * - Switching breakpoint when on a page that would exceed new totalPages resets to 1
 * - tickets.length change still resets page (regression guard)
 * - Navigating pages still works normally after a breakpoint switch
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, useState } from "vitest";
import { MemoryRouter, Route, Routes, Outlet } from "react-router-dom";
import React from "react";
import TicketCollection from "../components/TicketCollection";
import type { AppOutletContext } from "../AppShell";
import type { Ticket } from "../API";

// Build N fake tickets
const makeTickets = (n: number): Ticket[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `t-${i + 1}`,
    name: `Ticket ${i + 1}`,
    ticketsID: "col-1",
    owner: "sub-1",
    type: "MOVIE",
    timeCreated: i,
    visibility: "PRIVATE" as any,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  } as Ticket));

// Wrapper that lets tests change isMobile and tickets after mount
function TestHarness({
  initialMobile,
  initialTickets,
}: {
  initialMobile: boolean;
  initialTickets: Ticket[];
}) {
  const [isMobile, setIsMobile] = React.useState(initialMobile);
  const [tickets, setTickets] = React.useState(initialTickets);

  const ctx: AppOutletContext = {
    tickets,
    isLoading: false,
    isMobile,
    ticketCollection: "col-1",
    fetchError: null,
    onRetryFetch: vi.fn(),
    handleAddTicket: vi.fn(),
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn(),
    onChangeSort: vi.fn(),
  };

  return (
    <>
      {/* Control buttons for tests */}
      <button onClick={() => setIsMobile(true)}  data-testid="set-mobile">mobile</button>
      <button onClick={() => setIsMobile(false)} data-testid="set-desktop">desktop</button>
      <button onClick={() => setTickets(makeTickets(tickets.length + 1))} data-testid="add-ticket">add</button>
      <Outlet context={ctx} />
    </>
  );
}

function renderCollection(initialMobile: boolean, ticketCount: number) {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<TestHarness initialMobile={initialMobile} initialTickets={makeTickets(ticketCount)} />}>
          <Route path="/" element={<TicketCollection />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("TicketCollection — breakpoint resize resets page", () => {
  it("resets to page 1 when switching from desktop to mobile", async () => {
    // 20 tickets: desktop shows 15/page (p1=1-15, p2=16-20)
    // mobile shows 8/page (p1=1-8, p2=9-16, p3=17-20)
    renderCollection(false, 20);

    // Navigate to page 2 on desktop
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/Page 2/)).toBeInTheDocument();

    // Simulate resize to mobile
    act(() => { fireEvent.click(screen.getByTestId("set-mobile")); });

    // Page should reset to 1
    await waitFor(() =>
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    );
  });

  it("resets to page 1 when switching from mobile to desktop", async () => {
    // 20 tickets: mobile shows 8/page → 3 pages
    renderCollection(true, 20);

    // Navigate to page 2 on mobile
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/Page 2/)).toBeInTheDocument();

    // Simulate resize to desktop
    act(() => { fireEvent.click(screen.getByTestId("set-desktop")); });

    await waitFor(() =>
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    );
  });

  it("resets to page 1 when page would exceed new totalPages after breakpoint change", async () => {
    // 17 tickets on mobile: 8/page → pages 1,2,3 (last page has 1 ticket)
    // Same on desktop: 15/page → pages 1,2 (last page has 2 tickets)
    renderCollection(true, 17);

    // Get to page 3 on mobile (p3 = ticket 17 only)
    fireEvent.click(screen.getByText("Next")); // page 2
    fireEvent.click(screen.getByText("Next")); // page 3
    expect(screen.getByText(/Page 3/)).toBeInTheDocument();

    // Switch to desktop: only 2 pages exist now
    act(() => { fireEvent.click(screen.getByTestId("set-desktop")); });

    // Page must reset — page 3 doesn't exist on desktop
    await waitFor(() =>
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    );
  });

  it("tickets still display correctly after breakpoint switch and reset", async () => {
    renderCollection(false, 20); // desktop, 20 tickets, 15/page

    // Go to page 2 (shows tickets 16-20)
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Ticket 16")).toBeInTheDocument();

    // Switch to mobile → reset to page 1 (shows tickets 1-8)
    act(() => { fireEvent.click(screen.getByTestId("set-mobile")); });

    await waitFor(() => expect(screen.getByText("Ticket 1")).toBeInTheDocument());
    expect(screen.queryByText("Ticket 16")).not.toBeInTheDocument();
  });

  it("tickets.length change still resets page to 1 (regression guard)", async () => {
    renderCollection(false, 20);

    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/Page 2/)).toBeInTheDocument();

    // Add a ticket (changes tickets.length)
    act(() => { fireEvent.click(screen.getByTestId("add-ticket")); });

    await waitFor(() =>
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    );
  });
});
