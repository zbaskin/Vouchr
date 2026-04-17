/**
 * Tests for optional star rating in TicketEdit dialog.
 *
 * Covers:
 * - Star rating group renders in the edit dialog
 * - Pre-populates with the ticket's current rating
 * - Shows Clear button when rating is set, hides it when null
 * - Passes changed rating to onEdit on save
 * - Passes null rating to onEdit when cleared
 * - Resets to new initial rating when a different ticket is opened
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
  onRemove: vi.fn(),
  onEdit: vi.fn().mockResolvedValue(undefined),
};

function openEditDialog() {
  fireEvent.click(screen.getByLabelText("Edit ticket"));
}

describe("Star rating in TicketEdit", () => {
  it("renders a star rating group in the edit dialog", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    expect(screen.getByRole("group", { name: /rating/i })).toBeInTheDocument();
  });

  it("shows no Clear button when ticket has no rating", () => {
    render(<Ticket {...BASE_PROPS} rating={null} />);
    openEditDialog();
    expect(screen.queryByRole("button", { name: /clear rating/i })).not.toBeInTheDocument();
  });

  it("shows the Clear button when ticket has a rating", () => {
    render(<Ticket {...BASE_PROPS} rating={3.5} />);
    openEditDialog();
    expect(screen.getByRole("button", { name: /clear rating/i })).toBeInTheDocument();
  });

  it("passes the changed rating to onEdit on save", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} rating={null} onEdit={onEdit} />);
    openEditDialog();

    fireEvent.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ rating: 4 }));
  });

  it("passes a half-star rating to onEdit on save", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} rating={null} onEdit={onEdit} />);
    openEditDialog();

    fireEvent.click(screen.getByRole("button", { name: "Rate 2.5 stars" }));
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ rating: 2.5 }));
  });

  it("passes null rating to onEdit when rating is cleared before save", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} rating={3} onEdit={onEdit} />);
    openEditDialog();

    fireEvent.click(screen.getByRole("button", { name: /clear rating/i }));
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ rating: null }));
  });

  it("resets to the new initial rating when a different ticket is opened", () => {
    const { rerender } = render(<Ticket {...BASE_PROPS} rating={4} />);
    openEditDialog();
    expect(screen.getByRole("button", { name: /clear rating/i })).toBeInTheDocument();

    rerender(<Ticket {...BASE_PROPS} id="t2" rating={null} />);
    openEditDialog();
    expect(screen.queryByRole("button", { name: /clear rating/i })).not.toBeInTheDocument();
  });
});
