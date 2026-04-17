/**
 * Tests for optional notes field in TicketForm.
 *
 * Covers:
 * - Textarea renders with an accessible label
 * - Defaults to empty string
 * - Typing updates the value
 * - Notes value is passed to handleAddTicket on submit
 * - Null/empty notes passed when textarea is blank
 * - Resets to empty after successful submit
 * - Resets to empty after Clear
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useOutletContext: vi.fn() };
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

describe("Notes field in TicketForm", () => {
  it("renders a textarea labeled Notes", () => {
    render(<TicketForm />);
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i).tagName).toBe("TEXTAREA");
  });

  it("defaults to empty", () => {
    render(<TicketForm />);
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe("");
  });

  it("updates as the user types", () => {
    render(<TicketForm />);
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Great film, loved the visuals." },
    });
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe(
      "Great film, loved the visuals."
    );
  });

  it("passes notes to handleAddTicket on submit", async () => {
    const handleAddTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleAddTicket })
    );

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Interstellar" },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Mind-blowing ending." },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(handleAddTicket).toHaveBeenCalledTimes(1));
    expect(handleAddTicket).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "Mind-blowing ending." })
    );
  });

  it("passes null notes when the textarea is empty", async () => {
    const handleAddTicket = vi.fn().mockResolvedValue(undefined);
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(
      buildContext({ handleAddTicket })
    );

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Silent Movie" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(handleAddTicket).toHaveBeenCalledTimes(1));
    expect(handleAddTicket).toHaveBeenCalledWith(
      expect.objectContaining({ notes: null })
    );
  });

  it("resets to empty after a successful submit", async () => {
    render(<TicketForm />);
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Some notes here." },
    });
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Reset Test" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() =>
      expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe("")
    );
  });

  it("resets to empty after clicking Clear", () => {
    render(<TicketForm />);
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "These notes should disappear." },
    });
    fireEvent.click(screen.getByText("Clear"));
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe("");
  });
});
