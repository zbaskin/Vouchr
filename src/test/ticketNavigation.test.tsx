/**
 * Tests for ticket card navigation.
 *
 * Covers:
 * - Ticket component calls onNavigate when card body is clicked
 * - Edit button click does NOT trigger onNavigate
 * - Remove button click does NOT trigger onNavigate
 * - TicketCollection passes a navigate handler to each card
 * - TicketCollection navigates to /app/ticket/:id on card click
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Ticket component tests ───────────────────────────────────────────────────

import Ticket from "../components/Ticket";

const BASE_TICKET = {
  id: "t1",
  name: "Oppenheimer",
  venue: "AMC Empire 25",
  eventDate: "2024-07-21",
  eventTime: "19:30:00",
  theater: "7",
  seat: "D4",
  onRemove: vi.fn(),
  onEdit: vi.fn().mockResolvedValue(undefined),
};

describe("Ticket — onNavigate prop", () => {
  it("calls onNavigate when the card body is clicked", () => {
    const onNavigate = vi.fn();
    render(<Ticket {...BASE_TICKET} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("AMC Empire 25"));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onNavigate when the edit button is clicked", () => {
    const onNavigate = vi.fn();
    render(<Ticket {...BASE_TICKET} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("does NOT call onNavigate when the remove button is clicked", () => {
    const onNavigate = vi.fn();
    render(<Ticket {...BASE_TICKET} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByLabelText("Remove ticket"));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("does not throw when onNavigate is not provided and card is clicked", () => {
    render(<Ticket {...BASE_TICKET} />);
    expect(() => fireEvent.click(screen.getByText("AMC Empire 25"))).not.toThrow();
  });
});

// ── TicketCollection navigation tests ───────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: vi.fn(),
    NavLink: ({ to, children, className }: any) => (
      <a href={to} className={className}>{children}</a>
    ),
  };
});

import { useOutletContext } from "react-router-dom";
import TicketCollection from "../components/TicketCollection";

const CONTEXT_TICKETS = [
  { id: "t1", name: "Oppenheimer", venue: "AMC Empire 25", eventDate: "2024-07-21", eventTime: "19:30:00", theater: "7", seat: "D4" },
  { id: "t2", name: "Dune: Part Two", venue: "IMAX", eventDate: "2024-03-01", eventTime: "19:00:00", theater: "1", seat: "A1" },
];

function buildCollectionContext(overrides = {}) {
  return {
    tickets: CONTEXT_TICKETS,
    isLoading: false,
    isMobile: false,
    fetchError: null,
    onRetryFetch: vi.fn(),
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn().mockResolvedValue(undefined),
    ticketCollection: "col-1",
    onChangeSort: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockNavigate.mockReset();
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(buildCollectionContext());
});

describe("TicketCollection — card navigation", () => {
  it("navigates to /app/ticket/:id when a ticket card is clicked", () => {
    render(<TicketCollection />);
    fireEvent.click(screen.getByText("AMC Empire 25"));
    expect(mockNavigate).toHaveBeenCalledWith("/app/ticket/t1");
  });

  it("navigates to the correct ticket when a different card is clicked", () => {
    render(<TicketCollection />);
    fireEvent.click(screen.getByText("IMAX"));
    expect(mockNavigate).toHaveBeenCalledWith("/app/ticket/t2");
  });
});
