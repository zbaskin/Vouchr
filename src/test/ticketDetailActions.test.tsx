/**
 * Tests for Edit and Delete actions on the TicketDetail page.
 *
 * Edit covers:
 * - Edit button is present
 * - Clicking Edit opens the TicketEdit dialog pre-populated with ticket values
 * - Saving calls handleEditTicket with updated values
 * - Dialog closes after a successful save
 *
 * Delete covers:
 * - Delete button is present
 * - Clicking Delete shows an inline confirmation
 * - Confirming calls handleRemoveTicket and navigates to /app/collection
 * - Cancelling dismisses the confirmation without calling handleRemoveTicket
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventType, Visibility } from "../API";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: vi.fn(),
    useOutletContext: vi.fn(),
    useNavigate: () => mockNavigate,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

import { useParams, useOutletContext } from "react-router-dom";
import TicketDetail from "../pages/TicketDetail";

const TICKET = {
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

function setupContext(overrides: Record<string, unknown> = {}) {
  (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ id: "ticket-abc" });
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue({
    tickets: [TICKET],
    isLoading: false,
    handleEditTicket: vi.fn().mockResolvedValue(undefined),
    handleRemoveTicket: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });
}

beforeEach(() => {
  mockNavigate.mockReset();
  setupContext();
});

// ── Edit ────────────────────────────────────────────────────────────────────

describe("TicketDetail — Edit", () => {
  it("renders an Edit button", () => {
    render(<TicketDetail />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("opens the TicketEdit dialog when Edit is clicked", () => {
    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("pre-populates the dialog with the current ticket name", () => {
    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByDisplayValue("Dune: Part Two")).toBeInTheDocument();
  });

  it("calls handleEditTicket with updated values on save", async () => {
    const handleEditTicket = vi.fn().mockResolvedValue(undefined);
    setupContext({ handleEditTicket });

    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    fireEvent.change(screen.getByDisplayValue("Dune: Part Two"), {
      target: { value: "Dune: Part Three" },
    });
    fireEvent.click(screen.getByText("Save changes"));

    await waitFor(() => expect(handleEditTicket).toHaveBeenCalledTimes(1));
    expect(handleEditTicket).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Dune: Part Three" })
    );
  });

  it("closes the dialog after a successful save", async () => {
    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByText("Save changes"));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });
});

// ── Delete ───────────────────────────────────────────────────────────────────

describe("TicketDetail — Delete", () => {
  it("renders a Delete button", () => {
    render(<TicketDetail />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows an inline confirmation when Delete is clicked", () => {
    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("calls handleRemoveTicket and navigates to collection on confirm", async () => {
    const handleRemoveTicket = vi.fn().mockResolvedValue(undefined);
    setupContext({ handleRemoveTicket });

    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => expect(handleRemoveTicket).toHaveBeenCalledWith("ticket-abc"));
    expect(mockNavigate).toHaveBeenCalledWith("/app/collection");
  });

  it("dismisses the confirmation without deleting when Cancel is clicked", () => {
    const handleRemoveTicket = vi.fn();
    setupContext({ handleRemoveTicket });

    render(<TicketDetail />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(handleRemoveTicket).not.toHaveBeenCalled();
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });
});
