/**
 * Tests for optional star rating in TicketForm.
 *
 * Covers:
 * - Star rating group renders in the form
 * - Defaults to no rating (Clear button hidden)
 * - Clicking a star sets the rating (Clear button appears)
 * - Clicking a half-star sets a half rating
 * - Rating is passed to handleAddTicket on submit
 * - Null rating is passed when no star is selected
 * - Rating resets to null after successful submit
 * - Rating resets to null after Clear
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useOutletContext: vi.fn(),
  };
});

vi.mock("react-datepicker", () => ({
  default: ({ onChange, selected, ...rest }: any) => (
    <input
      data-testid={rest.id ?? "datepicker"}
      value={selected ? selected.toISOString() : ""}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
      {...rest}
    />
  ),
}));

import { useOutletContext } from "react-router-dom";
import TicketForm from "../components/TicketForm";

function buildContext(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ticketCollection: "col-123",
    handleAddTicket: vi.fn().mockResolvedValue(undefined),
    tickets: [],
    isLoading: false,
    isMobile: false,
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn(),
    fetchError: null,
    onRetryFetch: vi.fn(),
    onChangeSort: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(buildContext());
});

describe("Star rating in TicketForm", () => {
  it("renders a star rating group labeled 'Rating'", () => {
    render(<TicketForm />);
    expect(screen.getByRole("group", { name: /rating/i })).toBeInTheDocument();
  });

  it("defaults to no rating — Clear button is not shown", () => {
    render(<TicketForm />);
    expect(screen.queryByRole("button", { name: /clear rating/i })).not.toBeInTheDocument();
  });

  it("renders star buttons for each half-increment up to 5", () => {
    render(<TicketForm />);
    expect(screen.getByRole("button", { name: "Rate 0.5 stars" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rate 1 stars" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rate 2.5 stars" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rate 5 stars" })).toBeInTheDocument();
  });

  it("clicking a full-star button shows the Clear button", () => {
    render(<TicketForm />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 3 stars" }));
    expect(screen.getByRole("button", { name: /clear rating/i })).toBeInTheDocument();
  });

  it("clicking a half-star button shows the Clear button", () => {
    render(<TicketForm />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 2.5 stars" }));
    expect(screen.getByRole("button", { name: /clear rating/i })).toBeInTheDocument();
  });

  it("passes the selected rating to handleAddTicket on submit", async () => {
    const handleAddTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleAddTicket })
    );

    render(<TicketForm />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Test Movie" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(handleAddTicket).toHaveBeenCalledTimes(1));
    expect(handleAddTicket).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 4 })
    );
  });

  it("passes null rating when no star is selected", async () => {
    const handleAddTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleAddTicket })
    );

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "No Rating Movie" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(handleAddTicket).toHaveBeenCalledTimes(1));
    expect(handleAddTicket).toHaveBeenCalledWith(
      expect.objectContaining({ rating: null })
    );
  });

  it("passes a half-star rating to handleAddTicket", async () => {
    const handleAddTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleAddTicket })
    );

    render(<TicketForm />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 3.5 stars" }));
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Half Star Movie" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(handleAddTicket).toHaveBeenCalledTimes(1));
    expect(handleAddTicket).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 3.5 })
    );
  });

  it("resets to no rating after a successful submit", async () => {
    render(<TicketForm />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Test Movie" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /clear rating/i })).not.toBeInTheDocument()
    );
  });

  it("resets to no rating after clicking Clear", () => {
    render(<TicketForm />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 3 stars" }));
    expect(screen.getByRole("button", { name: /clear rating/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear"));
    expect(screen.queryByRole("button", { name: /clear rating/i })).not.toBeInTheDocument();
  });
});
