/**
 * Tests for EventType selector in TicketEdit dialog.
 *
 * Covers:
 * - Selector renders in the edit dialog
 * - Selector is pre-populated with the ticket's current event type
 * - Changing selection is passed to onEdit on save
 * - Selector resets to the new initial type when a different ticket is opened
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
  onRemove: vi.fn(),
  onEdit: vi.fn().mockResolvedValue(undefined),
};

function openEditDialog() {
  fireEvent.click(screen.getByLabelText("Edit ticket"));
}

describe("TicketEdit EventType selector", () => {
  it("renders an Event type selector in the edit dialog", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
  });

  it("pre-populates with the ticket's current event type", () => {
    render(<Ticket {...BASE_PROPS} type={EventType.CONCERT} />);
    openEditDialog();
    const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
    expect(select.value).toBe(EventType.CONCERT);
  });

  it("lists all four EventType options", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain(EventType.MOVIE);
    expect(options).toContain(EventType.CONCERT);
    expect(options).toContain(EventType.SPORT);
    expect(options).toContain(EventType.FLIGHT);
    expect(options).toHaveLength(4);
  });

  it("passes the changed event type to onEdit on save", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} onEdit={onEdit} />);
    openEditDialog();

    fireEvent.change(screen.getByLabelText(/event type/i), {
      target: { value: EventType.SPORT },
    });
    fireEvent.click(screen.getByText("Save changes"));

    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ type: EventType.SPORT })
    );
  });

  it("resets to the new initial type when a different ticket is opened", () => {
    const { rerender } = render(<Ticket {...BASE_PROPS} type={EventType.MOVIE} />);
    openEditDialog();

    const select = screen.getByLabelText(/event type/i) as HTMLSelectElement;
    expect(select.value).toBe(EventType.MOVIE);

    // Simulate opening a different ticket (prop change resets form via useEffect)
    rerender(<Ticket {...BASE_PROPS} id="t2" type={EventType.FLIGHT} />);

    expect((screen.getByLabelText(/event type/i) as HTMLSelectElement).value).toBe(
      EventType.FLIGHT
    );
  });
});
