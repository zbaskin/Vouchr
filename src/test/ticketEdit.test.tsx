import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Ticket from "../components/Ticket";

const BASE_PROPS = {
  id: "t1",
  name: "Oppenheimer",
  venue: "AMC Empire 25",
  eventDate: "2024-07-21",
  eventTime: "19:30:00",
  theater: "7",
  seat: "D4",
  onRemove: vi.fn(),
  onEdit: vi.fn().mockResolvedValue(undefined),
};

function openEditDialog() {
  fireEvent.click(screen.getByLabelText("Edit ticket"));
}

describe("TicketEdit form stability", () => {
  it("opens the edit dialog when the edit button is clicked", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("populates fields with the current ticket values on open", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    expect(screen.getByDisplayValue("Oppenheimer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AMC Empire 25")).toBeInTheDocument();
  });

  it("reflects user edits to the name field", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    const nameInput = screen.getByDisplayValue("Oppenheimer");
    fireEvent.change(nameInput, { target: { value: "Oppenheimer: Extended Cut" } });
    expect(screen.getByDisplayValue("Oppenheimer: Extended Cut")).toBeInTheDocument();
  });

  it("does NOT reset form state when the parent re-renders with identical props", () => {
    const { rerender } = render(<Ticket {...BASE_PROPS} />);
    openEditDialog();

    // User edits the name
    const nameInput = screen.getByDisplayValue("Oppenheimer");
    fireEvent.change(nameInput, { target: { value: "Dune: Part Two" } });
    expect(screen.getByDisplayValue("Dune: Part Two")).toBeInTheDocument();

    // Parent re-renders with the exact same prop values (simulates a parent state update
    // that has nothing to do with this ticket, e.g., another ticket being added)
    rerender(<Ticket {...BASE_PROPS} />);

    // The user's typed value should still be there — not reset to "Oppenheimer"
    expect(screen.getByDisplayValue("Dune: Part Two")).toBeInTheDocument();
  });

  it("closes the dialog when Cancel is clicked", () => {
    render(<Ticket {...BASE_PROPS} />);
    openEditDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onEdit with the edited values when Save changes is clicked", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<Ticket {...BASE_PROPS} onEdit={onEdit} />);
    openEditDialog();

    fireEvent.change(screen.getByDisplayValue("Oppenheimer"), {
      target: { value: "Tenet" },
    });

    fireEvent.click(screen.getByText("Save changes"));
    await vi.waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Tenet" })
    );
  });
});
