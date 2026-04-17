/**
 * Tests for star rating display on TicketDetail page.
 *
 * Covers:
 * - Displays rating as accessible image element when ticket has a rating
 * - Does not render rating section when ticket has no rating
 * - Displays half-star ratings correctly in the aria-label
 * - Rating section has a "Rating" label
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

describe("TicketDetail star rating display", () => {
  it("does not render a rating element when ticket has no rating", () => {
    setupContext([{ ...FULL_TICKET, rating: null }]);
    render(<TicketDetail />);
    expect(screen.queryByRole("img", { name: /stars/i })).not.toBeInTheDocument();
  });

  it("renders a rating image element when ticket has a whole-number rating", () => {
    setupContext([{ ...FULL_TICKET, rating: 4 }]);
    render(<TicketDetail />);
    expect(screen.getByRole("img", { name: /4.*5 stars/i })).toBeInTheDocument();
  });

  it("renders a rating image element when ticket has a half-star rating", () => {
    setupContext([{ ...FULL_TICKET, rating: 3.5 }]);
    render(<TicketDetail />);
    expect(screen.getByRole("img", { name: /3\.5.*5 stars/i })).toBeInTheDocument();
  });

  it("renders a rating label above the stars", () => {
    setupContext([{ ...FULL_TICKET, rating: 5 }]);
    render(<TicketDetail />);
    expect(screen.getByText(/rating/i)).toBeInTheDocument();
  });

  it("renders the minimum half-star rating correctly", () => {
    setupContext([{ ...FULL_TICKET, rating: 0.5 }]);
    render(<TicketDetail />);
    expect(screen.getByRole("img", { name: /0\.5.*5 stars/i })).toBeInTheDocument();
  });

  it("renders the maximum 5-star rating correctly", () => {
    setupContext([{ ...FULL_TICKET, rating: 5 }]);
    render(<TicketDetail />);
    expect(screen.getByRole("img", { name: /5.*5 stars/i })).toBeInTheDocument();
  });
});
