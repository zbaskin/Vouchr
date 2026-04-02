/**
 * Tests for Error #4 — handleAddTicket not awaited, no error feedback.
 *
 * Covers:
 * - Form resets only AFTER a successful save
 * - Form is NOT reset when the save throws
 * - An error message is shown when the save throws
 * - Submit button is disabled while submission is in-flight
 * - Submit button re-enables after failure (user can retry)
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock react-router-dom so we can inject our own outlet context
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useOutletContext: vi.fn(),
  };
});

// Mock react-datepicker so it renders a plain <input> we can interact with
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
    ...overrides,
  };
}

beforeEach(() => {
  (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(buildContext());
});

describe("TicketForm submission", () => {
  it("resets the name field after a successful submission", async () => {
    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Oppenheimer" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));
    await waitFor(() =>
      expect((screen.getByPlaceholderText(/dune/i) as HTMLInputElement).value).toBe("")
    );
  });

  it("does NOT reset the form when handleAddTicket throws", async () => {
    const ctx = buildContext({
      handleAddTicket: vi.fn().mockRejectedValue(new Error("Network error")),
    });
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(ctx);

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Oppenheimer" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() =>
      expect((screen.getByPlaceholderText(/dune/i) as HTMLInputElement).value).toBe(
        "Oppenheimer"
      )
    );
  });

  it("shows an error message when handleAddTicket throws", async () => {
    const ctx = buildContext({
      handleAddTicket: vi.fn().mockRejectedValue(new Error("Network error")),
    });
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(ctx);

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Oppenheimer" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
  });

  it("disables the submit button while submission is in-flight", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((res) => { resolve = res; });
    const ctx = buildContext({ handleAddTicket: vi.fn().mockReturnValue(pending) });
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(ctx);

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Oppenheimer" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    // Button label changes to "Saving…" while in-flight — find it by role
    await waitFor(() =>
      expect(screen.getByText("Saving…")).toBeDisabled()
    );

    resolve(); // Let the promise settle
  });

  it("re-enables the submit button after a failed submission", async () => {
    const ctx = buildContext({
      handleAddTicket: vi.fn().mockRejectedValue(new Error("fail")),
    });
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(ctx);

    render(<TicketForm />);
    fireEvent.change(screen.getByPlaceholderText(/dune/i), {
      target: { value: "Oppenheimer" },
    });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() =>
      expect(screen.getByText("Add Ticket")).not.toBeDisabled()
    );
  });

  it("clears the error message when the user edits the title after a failure", async () => {
    const ctx = buildContext({
      handleAddTicket: vi.fn().mockRejectedValue(new Error("fail")),
    });
    (useOutletContext as ReturnType<typeof vi.fn>).mockReturnValue(ctx);

    render(<TicketForm />);
    const input = screen.getByPlaceholderText(/dune/i);
    fireEvent.change(input, { target: { value: "Oppenheimer" } });
    fireEvent.click(screen.getByText("Add Ticket"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    fireEvent.change(input, { target: { value: "Tenet" } });

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );
  });
});
