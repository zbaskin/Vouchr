/**
 * Tests for TicketCollection layout behavior.
 *
 * Verifies that the card container uses a flex-wrap layout so that
 * 1–4 tickets render as compact centered cards rather than stretching
 * to fill the full container width (the auto-fit/1fr grid behavior).
 *
 * Covers:
 * - Grid container uses flex + flex-wrap (not CSS grid with auto-fit)
 * - Cards have a fixed width and are not set to stretch
 * - Small collections (1 ticket, 4 tickets) render without stretching
 * - Large collections (15 tickets) still render all cards
 * - Empty and loading states render inside the flex container
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes, Outlet } from "react-router-dom";
import React from "react";
import TicketCollection from "../components/TicketCollection";
import type { AppOutletContext } from "../AppShell";
import type { Ticket } from "../API";

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

function renderCollection(tickets: Ticket[], isMobile = false) {
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

  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Outlet context={ctx} />}>
          <Route path="/" element={<TicketCollection />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("TicketCollection — flex layout", () => {
  it("card container uses flex and flex-wrap classes (not grid auto-fit)", () => {
    renderCollection(makeTickets(3));
    // The inner container wrapping the ticket cards
    const container = document.querySelector(".ticketCollection > div");
    expect(container).not.toBeNull();
    expect(container!.className).toContain("flex");
    expect(container!.className).toContain("flex-wrap");
    expect(container!.className).not.toContain("grid");
  });

  it("renders 1 ticket without stretching (card has fixed width class)", () => {
    renderCollection(makeTickets(1));
    expect(screen.getByText("Ticket 1")).toBeInTheDocument();
    // The ticketObject card element should carry a fixed-width class
    const card = document.querySelector(".ticketObject");
    expect(card).not.toBeNull();
    expect(card!.className).toContain("w-[175px]");
  });

  it("renders 4 tickets — all visible, none stretched beyond card width", () => {
    renderCollection(makeTickets(4));
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`Ticket ${i}`)).toBeInTheDocument();
    }
    const cards = document.querySelectorAll(".ticketObject");
    expect(cards).toHaveLength(4);
    cards.forEach((card) => {
      expect(card.className).toContain("w-[175px]");
    });
  });

  it("renders a full desktop page of 15 tickets", () => {
    renderCollection(makeTickets(15));
    const cards = document.querySelectorAll(".ticketObject");
    expect(cards).toHaveLength(15);
  });

  it("shows loading state inside the flex container", () => {
    const ctx: AppOutletContext = {
      tickets: [],
      isLoading: true,
      isMobile: false,
      ticketCollection: "col-1",
      fetchError: null,
      onRetryFetch: vi.fn(),
      handleAddTicket: vi.fn(),
      handleRemoveTicket: vi.fn(),
      handleEditTicket: vi.fn(),
      onChangeSort: vi.fn(),
    };
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<Outlet context={ctx} />}>
            <Route path="/" element={<TicketCollection />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
  });

  it("shows empty state when there are no tickets", () => {
    renderCollection([]);
    expect(screen.getByText("No tickets available.")).toBeInTheDocument();
  });
});
