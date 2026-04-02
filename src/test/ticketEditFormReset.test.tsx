/**
 * Tests for MEDIUM Error #5 — re-opening the edit modal shows stale unsaved values.
 *
 * Planner's description: "initialEdit is memoized with useMemo. When the user opens
 * the modal, makes changes, cancels, and re-opens, `initial` is the same object
 * reference so useEffect(() => setV(initial), [initial]) does not fire and the form
 * shows the previously-typed values."
 *
 * HOWEVER — the planner's analysis has a faulty premise. Ticket.tsx renders TicketEdit
 * conditionally: `{editing && onEdit && <TicketEdit>}`. When editing=false the component
 * is UNMOUNTED (not just hidden), so React discards all state. When editing becomes true
 * again, TicketEdit mounts fresh and useState(initial) always starts with the current
 * initial value. The useEffect reset is redundant but harmless.
 *
 * The tests below verify the correct behavior AND act as a regression guard to ensure
 * a future refactor (e.g. keeping TicketEdit mounted and using the open prop to
 * show/hide it) doesn't break the reset behavior.
 *
 * Covers:
 * - Form fields show original values when modal is first opened
 * - Typing unsaved values then cancelling and re-opening shows original values (not typed)
 * - saveError banner is not visible on re-open (state discarded with unmount)
 * - The close button (Cancel inside dialog) triggers reset on re-open
 * - Changes to ticket props (e.g. name updated after a successful save) are reflected
 *   when the modal is re-opened
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import Ticket from "../components/Ticket";

const BASE_PROPS = {
  id: "t-1",
  name: "Original Name",
  venue: "Original Venue",
  eventDate: "2024-06-15",
  eventTime: "20:00:00",
  theater: "Hall A",
  seat: "Row 1",
  onRemove: vi.fn(),
  onEdit: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => vi.clearAllMocks());

describe("Ticket — edit modal form reset on re-open", () => {
  it("shows the original name when the modal is first opened", () => {
    render(<Ticket {...BASE_PROPS} />);
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    expect(screen.getByDisplayValue("Original Name")).toBeInTheDocument();
  });

  it("resets name to original value after typing an unsaved change and cancelling", async () => {
    render(<Ticket {...BASE_PROPS} />);

    // Open, type an unsaved change, cancel
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    fireEvent.change(screen.getByDisplayValue("Original Name"), {
      target: { value: "Typed But Unsaved" },
    });
    expect(screen.getByDisplayValue("Typed But Unsaved")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Re-open — must show original value, not "Typed But Unsaved"
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    expect(screen.getByDisplayValue("Original Name")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Typed But Unsaved")).not.toBeInTheDocument();
  });

  it("resets venue to original value after an unsaved change and cancel", async () => {
    render(<Ticket {...BASE_PROPS} />);

    fireEvent.click(screen.getByLabelText("Edit ticket"));
    fireEvent.change(screen.getByDisplayValue("Original Venue"), {
      target: { value: "Different Venue" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByLabelText("Edit ticket"));

    expect(screen.getByDisplayValue("Original Venue")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Different Venue")).not.toBeInTheDocument();
  });

  it("does not show a saveError banner when reopening after a cancel", async () => {
    // Simulate a save failure: onEdit throws so saveError appears
    BASE_PROPS.onEdit.mockRejectedValueOnce(new Error("Network failure"));
    render(<Ticket {...BASE_PROPS} />);

    fireEvent.click(screen.getByLabelText("Edit ticket"));
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );

    // Cancel and re-open — error banner must be gone
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByLabelText("Edit ticket"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reflects updated prop values when reopened after a successful save", async () => {
    const { rerender } = render(<Ticket {...BASE_PROPS} />);

    // Simulate a successful save that updates the parent's name prop
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => expect(BASE_PROPS.onEdit).toHaveBeenCalledTimes(1));

    // Parent updates the prop (as AppShell would after a successful edit)
    rerender(<Ticket {...BASE_PROPS} name="Saved New Name" />);

    // Re-open — must show the updated prop value
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    expect(screen.getByDisplayValue("Saved New Name")).toBeInTheDocument();
  });
});
