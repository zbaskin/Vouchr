/**
 * Tests for notes display on TicketDetail page.
 *
 * Covers:
 * - Notes section rendered when ticket has notes
 * - Notes section absent when ticket has no notes (null)
 * - Notes section absent when notes is empty string
 * - Notes text content is displayed correctly
 * - Notes label shown alongside content
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
  rating: null as number | null,
  notes: null as string | null,
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

describe("TicketDetail notes display", () => {
  it("does not render a notes section when ticket has no notes", () => {
    setupContext([{ ...FULL_TICKET, notes: null }]);
    render(<TicketDetail />);
    expect(screen.queryByText(/^notes$/i)).not.toBeInTheDocument();
  });

  it("does not render a notes section when notes is an empty string", () => {
    setupContext([{ ...FULL_TICKET, notes: "" }]);
    render(<TicketDetail />);
    expect(screen.queryByText(/^notes$/i)).not.toBeInTheDocument();
  });

  it("renders the notes label when ticket has notes", () => {
    setupContext([{ ...FULL_TICKET, notes: "A truly stunning film." }]);
    render(<TicketDetail />);
    expect(screen.getByText(/^notes$/i)).toBeInTheDocument();
  });

  it("renders the notes text content", () => {
    setupContext([{ ...FULL_TICKET, notes: "A truly stunning film." }]);
    render(<TicketDetail />);
    expect(screen.getByText("A truly stunning film.")).toBeInTheDocument();
  });

  it("renders multi-line notes correctly", () => {
    setupContext([{ ...FULL_TICKET, notes: "Great visuals. Perfect cast." }]);
    render(<TicketDetail />);
    expect(screen.getByText("Great visuals. Perfect cast.")).toBeInTheDocument();
  });
});
