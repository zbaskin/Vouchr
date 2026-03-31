/**
 * Tests for Error #5 — TicketEdit silently blocks save when eventDate is empty/invalid.
 *
 * Root cause: onSubmit has `if (!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)) return;`
 * which bails with no feedback. The `required` attribute on the input is bypassed
 * because e.preventDefault() is called first, preventing native HTML5 validation.
 *
 * Fix: replace the silent early return with setSaveError("...") so the user knows
 * why the save was blocked. The existing red alert UI is reused for this.
 *
 * Covers:
 * - Submitting with an empty date shows an error alert
 * - Submitting with an invalid date string shows an error alert
 * - Error message is specific about the date field
 * - onSave is NOT called when the date is invalid
 * - Error clears when the user fixes the date and re-submits successfully
 * - Valid date still saves normally (regression guard)
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TicketEdit, { TicketEditValues } from "../components/TicketEdit";

const VALID: TicketEditValues = {
  id: "t1",
  name: "Oppenheimer",
  venue: "AMC Empire 25",
  eventDate: "2024-07-21",
  eventTime: "19:30",
  theater: "7",
  seat: "D4",
};

const EMPTY_DATE: TicketEditValues = { ...VALID, eventDate: "" };
const BAD_DATE: TicketEditValues = { ...VALID, eventDate: "not-a-date" };

// Submit the form element directly to bypass JSDOM's HTML5 constraint validation
// (which blocks the submit event before React's onSubmit fires when `required`
// fields are empty). We want to test our JS validation, not the browser's native UI.
function submitForm() {
  fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
}

beforeEach(() => vi.clearAllMocks());

describe("TicketEdit — date validation feedback", () => {
  it("shows an error alert when submitted with an empty eventDate", async () => {
    const onSave = vi.fn();
    render(<TicketEdit open initial={EMPTY_DATE} onCancel={vi.fn()} onSave={onSave} />);

    submitForm();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
  });

  it("does NOT call onSave when eventDate is empty", async () => {
    const onSave = vi.fn();
    render(<TicketEdit open initial={EMPTY_DATE} onCancel={vi.fn()} onSave={onSave} />);

    submitForm();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("shows an error alert when submitted with an invalid date string", async () => {
    const onSave = vi.fn();
    render(<TicketEdit open initial={BAD_DATE} onCancel={vi.fn()} onSave={onSave} />);

    submitForm();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
  });

  it("error message mentions the date field", async () => {
    const onSave = vi.fn();
    render(<TicketEdit open initial={EMPTY_DATE} onCancel={vi.fn()} onSave={onSave} />);

    submitForm();

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent?.toLowerCase()).toMatch(/date/);
    });
  });

  it("does NOT call onCancel when date validation fails", async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    render(<TicketEdit open initial={EMPTY_DATE} onCancel={onCancel} onSave={onSave} />);

    submitForm();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("clears the date error and saves successfully after user fixes the date", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    render(<TicketEdit open initial={EMPTY_DATE} onCancel={onCancel} onSave={onSave} />);

    // First submit: should show error
    submitForm();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    // Fix the date via the controlled input
    const dateInput = screen.getByDisplayValue("");
    fireEvent.change(dateInput, { target: { value: "2024-07-21" } });

    // Re-submit: should succeed and close
    submitForm();
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("saves normally when date is valid (regression guard)", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    render(<TicketEdit open initial={VALID} onCancel={onCancel} onSave={onSave} />);

    submitForm();

    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
