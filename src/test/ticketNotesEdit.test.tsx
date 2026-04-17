/**
 * Tests for optional notes field in TicketEdit dialog.
 *
 * Covers:
 * - Textarea renders in the edit dialog
 * - Pre-populated with ticket's current notes
 * - Empty when ticket has no notes
 * - Changed notes passed to onEdit on save
 * - Cleared notes (empty string → null) passed to onEdit
 * - Resets to new initial notes when a different ticket is opened
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Ticket from "../components/Ticket";
import { EventType } from "../API";

const BASE_PROPS = {
  id: "t1",
  name: "Oppenheimer",
  venue: "AMC Empire 25",
  eventDate: "2024-07-21",
  eventTime: "19:30:00",
  theater: "7",
  seat: "D4",
  type: EventType.MOVIE,
  rating: null as number | null,
  notes: null as string | null,
  onRemove: vi.fn(),
  onEdit: vi.fn().mockResolvedValue(undefined),
};

function openEditDialog() {
  fireEvent.click(screen.getByLabelText("Edit ticket"));
}

describe("Notes field in TicketEdit", () => {
  it("renders a textarea labeled Notes in the edit dialog", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    const textarea = screen.getByLabelText(/notes/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("is empty when ticket has no notes", () => {
    render(<Ticket {...BASE_PROPS} notes={null} />);
    openEditDialog();
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe("");
  });

  it("pre-populates with the ticket's current notes", () => {
    render(<Ticket {...BASE_PROPS} notes="What a film." />);
    openEditDialog();
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe(
      "What a film."
    );
  });

  it("passes changed notes to onEdit on save", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} notes={null} onEdit={onEdit} />);
    openEditDialog();

    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Incredible acting." },
    });
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "Incredible acting." })
    );
  });

  it("passes null notes to onEdit when textarea is cleared", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} notes="Old note" onEdit={onEdit} />);
    openEditDialog();

    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: "" } });
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ notes: null })
    );
  });

  it("resets to the new initial notes when a different ticket is opened", () => {
    const { rerender } = render(<Ticket {...BASE_PROPS} notes="First note" />);
    openEditDialog();
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe("First note");

    rerender(<Ticket {...BASE_PROPS} id="t2" notes={null} />);
    openEditDialog();
    expect((screen.getByLabelText(/notes/i) as HTMLTextAreaElement).value).toBe("");
  });
});
