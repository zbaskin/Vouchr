/**
 * Tests for TicketEdit backdrop click behavior.
 *
 * Covers:
 * - Clicking the backdrop overlay calls onCancel
 * - Clicking inside the dialog panel does NOT call onCancel
 * - When edit dialog is open inside a Ticket card, clicking the backdrop
 *   does NOT trigger onNavigate (event must not bubble to the card)
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TicketEdit, { type TicketEditValues } from "../components/TicketEdit";
import Ticket from "../components/Ticket";
import { EventType } from "../API";

const INITIAL: TicketEditValues = {
  id: "t1",
  name: "Oppenheimer",
  venue: "AMC Empire 25",
  eventDate: "2024-07-21",
  eventTime: "19:30:00",
  theater: "7",
  seat: "D4",
  type: EventType.MOVIE,
};

// ── TicketEdit backdrop ───────────────────────────────────────────────────────

describe("TicketEdit — backdrop click", () => {
  it("calls onCancel when the backdrop overlay is clicked", () => {
    const onCancel = vi.fn();
    render(
      <TicketEdit open initial={INITIAL} onCancel={onCancel} onSave={vi.fn()} />
    );
    // Click the outer overlay (role="dialog"), not the inner panel
    fireEvent.click(screen.getByRole("dialog"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onCancel when clicking inside the dialog panel", () => {
    const onCancel = vi.fn();
    render(
      <TicketEdit open initial={INITIAL} onCancel={onCancel} onSave={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Edit Ticket"));
    expect(onCancel).not.toHaveBeenCalled();
  });
});

// ── Ticket card — no navigation on backdrop click ─────────────────────────────

describe("Ticket — edit dialog backdrop does not trigger onNavigate", () => {
  it("does NOT call onNavigate when the edit dialog backdrop is clicked", () => {
    const onNavigate = vi.fn();
    render(
      <Ticket
        id="t1"
        name="Oppenheimer"
        venue="AMC Empire 25"
        eventDate="2024-07-21"
        eventTime="19:30:00"
        theater="7"
        seat="D4"
        onRemove={vi.fn()}
        onEdit={vi.fn().mockResolvedValue(undefined)}
        onNavigate={onNavigate}
      />
    );

    // Open the edit dialog
    fireEvent.click(screen.getByLabelText("Edit ticket"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Click the backdrop
    fireEvent.click(screen.getByRole("dialog"));

    // Dialog should close, navigation should NOT fire
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
