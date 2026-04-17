/**
 * Tests for EventType selector in TicketForm.
 *
 * Covers:
 * - Selector renders with all EventType options
 * - Defaults to MOVIE
 * - Changing selection is reflected in submitted ticket
 * - Selector resets to MOVIE after successful submit
 * - Selector resets to MOVIE after Clear
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
import { EventType } from "../API";

function buildContext(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ticketCollection: "col-123",
    handleAddTicket: vi.fn().mockResolvedValue(undefined),
    tickets: [],
    isLoading: false,
    isMobile: false,
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(buildContext());
});

describe("TicketForm EventType selector", () => {
  it("renders a selector labeled Event type", () => {
    render(<TicketForm />);
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
  });

  it("defaults to MOVIE", () => {
    render(<TicketForm />);
    const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
    expect(select.value).toBe(EventType.MOVIE);
  });

  it("lists all four EventType options", () => {
    render(<TicketForm />);
    const select = screen.getByLabelText(/event type/i);
    const options = Array.from((select as HTMLSelectElement).options).map(
      (o) => o.value
    );
    expect(options).toContain(EventType.MOVIE);
    expect(options).toContain(EventType.CONCERT);
    expect(options).toContain(EventType.SPORT);
    expect(options).toContain(EventType.FLIGHT);
    expect(options).toHaveLength(4);
  });

  it("passes the selected EventType to handleAddTicket on submit", async () => {
    const handleAddTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleAddTicket })
    );

    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText(/event type/i), {
      target: { value: EventType.CONCERT },
    });
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Coldplay Live" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(handleAddTicket).toHaveBeenCalledTimes(1));
    expect(handleAddTicket).toHaveBeenCalledWith(
      expect.objectContaining({ type: EventType.CONCERT })
    );
  });

  it("resets to MOVIE after a successful submit", async () => {
    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText(/event type/i), {
      target: { value: EventType.SPORT },
    });
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Yankees Game" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => {
      const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
      expect(select.value).toBe(EventType.MOVIE);
    });
  });

  it("resets to MOVIE after clicking Clear", () => {
    render(<TicketForm />);

    fireEvent.change(screen.getByLabelText(/event type/i), {
      target: { value: EventType.FLIGHT },
    });
    fireEvent.click(screen.getByText("Clear"));

    const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
    expect(select.value).toBe(EventType.MOVIE);
  });
});
