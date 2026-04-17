/**
 * Tests for TicketDetail page — /app/ticket/:id
 *
 * Covers:
 * - Renders core ticket fields (title, type, venue, theater, seat, date, time)
 * - Displays event type in human-readable form
 * - Shows not-found state when ID doesn't match any ticket
 * - Renders gracefully when optional fields are null
 * - Has a back link to the collection
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventType, Visibility } from "../API";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: vi.fn(),
    useOutletContext: vi.fn(),
    useNavigate: () => vi.fn(),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

import { useParams, useOutletContext } from "react-router-dom";
import TicketDetail from "../pages/TicketDetail";

const FULL_TICKET = {
  __typename: "Ticket" as const,
  id: "ticket-abc",
  owner: "user-1",
  name: "Dune: Part Two",
  type: EventType.MOVIE,
  venue: "AMC Lincoln Square 13",
  theater: "IMAX",
  seat: "G7",
  city: "New York",
  eventDate: "2024-03-01",
  eventTime: "19:30:00",
  timeCreated: 1709320200,
  ticketsID: "col-1",
  visibility: Visibility.PRIVATE,
  createdAt: "2024-03-01T20:00:00Z",
  updatedAt: "2024-03-01T20:00:00Z",
};

function setupContext(tickets: unknown[] = [FULL_TICKET], id = "ticket-abc") {
  (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ id });
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue({
    tickets,
    isLoading: false,
    handleEditTicket: vi.fn().mockResolvedValue(undefined),
    handleRemoveTicket: vi.fn().mockResolvedValue(undefined),
  });
}

beforeEach(() => {
  setupContext();
});

describe("TicketDetail page", () => {
  it("renders the ticket title", () => {
    render(<TicketDetail />);
    expect(screen.getByText("Dune: Part Two")).toBeInTheDocument();
  });

  it("displays event type in human-readable form", () => {
    render(<TicketDetail />);
    expect(screen.getByText("Movie")).toBeInTheDocument();
  });

  it("renders the venue", () => {
    render(<TicketDetail />);
    expect(screen.getByText("AMC Lincoln Square 13")).toBeInTheDocument();
  });

  it("renders theater and seat", () => {
    render(<TicketDetail />);
    expect(screen.getByText(/IMAX/)).toBeInTheDocument();
    expect(screen.getByText(/G7/)).toBeInTheDocument();
  });

  it("renders the event date", () => {
    render(<TicketDetail />);
    // handleTicketDate formats "2024-03-01" → "03/01/2024"
    expect(screen.getByText(/03\/01\/2024/)).toBeInTheDocument();
  });

  it("has a link back to the collection", () => {
    render(<TicketDetail />);
    const link = screen.getByRole("link", { name: /back|collection/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/app/collection");
  });

  it("shows a not-found message when the ID has no match", () => {
    setupContext([FULL_TICKET], "does-not-exist");
    render(<TicketDetail />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it("renders gracefully when optional fields are null", () => {
    const minimal = {
      ...FULL_TICKET,
      id: "ticket-min",
      venue: null,
      theater: null,
      seat: null,
      city: null,
      eventDate: null,
      eventTime: null,
    };
    setupContext([minimal], "ticket-min");
    render(<TicketDetail />);
    expect(screen.getByText("Dune: Part Two")).toBeInTheDocument();
  });

  it("displays human-readable label for CONCERT type", () => {
    const concert = { ...FULL_TICKET, id: "ticket-concert", type: EventType.CONCERT };
    setupContext([concert], "ticket-concert");
    render(<TicketDetail />);
    expect(screen.getByText("Concert")).toBeInTheDocument();
  });
});
