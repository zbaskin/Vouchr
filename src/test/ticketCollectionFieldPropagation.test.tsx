/**
 * Regression tests: TicketCollection must forward type, rating, and notes
 * to each Ticket card so the edit dialog pre-populates with the correct
 * values. Without this, saving from the collection overwrites those fields
 * with null even when the user makes no changes.
 *
 * Covers:
 * - Edit dialog pre-populates rating from the ticket in context
 * - Edit dialog pre-populates notes from the ticket in context
 * - Edit dialog pre-populates event type from the ticket in context
 * - onEdit receives correct rating when user saves without changing it
 * - onEdit receives correct notes when user saves without changing it
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventType, Visibility } from "../API";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useOutletContext: vi.fn(),
    useNavigate: () => vi.fn(),
    NavLink: ({ to, children, className }: any) => (
      <a href={to} className={className}>{children}</a>
    ),
  };
});

import { useOutletContext } from "react-router-dom";
import TicketCollection from "../components/TicketCollection";

const TICKET = {
  __typename: "Ticket" as const,
  id: "t1",
  owner: "user-1",
  name: "Dune: Part Two",
  type: EventType.CONCERT,
  venue: "Madison Square Garden",
  theater: "Floor",
  seat: "A1",
  city: "New York",
  eventDate: "2024-03-01",
  eventTime: "19:30:00",
  timeCreated: 1709320200,
  ticketsID: "col-1",
  visibility: Visibility.PRIVATE,
  rating: 4.5,
  notes: "Absolutely incredible show.",
  createdAt: "2024-03-01T20:00:00Z",
  updatedAt: "2024-03-01T20:00:00Z",
};

function buildContext(overrides = {}) {
  return {
    tickets: [TICKET],
    isLoading: false,
    isMobile: false,
    fetchError: null,
    onRetryFetch: vi.fn(),
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn().mockResolvedValue(undefined),
    onChangeSort: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(buildContext());
});

function openEditDialog() {
  fireEvent.click(screen.getByLabelText("Edit ticket"));
}

describe("TicketCollection field propagation to edit dialog", () => {
  it("pre-populates the edit dialog with the ticket's rating", () => {
    render(<TicketCollection />);
    openEditDialog();
    expect(screen.getByRole("button", { name: /clear rating/i })).toBeInTheDocument();
  });

  it("pre-populates the edit dialog with the ticket's notes", () => {
    render(<TicketCollection />);
    openEditDialog();
    const textarea = screen.getByLabelText(/notes/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Absolutely incredible show.");
  });

  it("pre-populates the edit dialog with the ticket's event type", () => {
    render(<TicketCollection />);
    openEditDialog();
    const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
    expect(select.value).toBe(EventType.CONCERT);
  });

  it("passes the existing rating to handleEditTicket when saved without changes", async () => {
    const handleEditTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleEditTicket })
    );

    render(<TicketCollection />);
    openEditDialog();
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(handleEditTicket).toHaveBeenCalledTimes(1));
    expect(handleEditTicket).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 4.5 })
    );
  });

  it("passes the existing notes to handleEditTicket when saved without changes", async () => {
    const handleEditTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleEditTicket })
    );

    render(<TicketCollection />);
    openEditDialog();
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(handleEditTicket).toHaveBeenCalledTimes(1));
    expect(handleEditTicket).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "Absolutely incredible show." })
    );
  });
});
