/**
 * Tests for Error #1 — TicketEdit provides no error feedback on failed save.
 *
 * Before fix: onSubmit calls `await onSave(v)` then `onCancel()` unconditionally.
 * If onSave throws, onCancel() is never reached — dialog stays open, no message shown.
 *
 * Covers:
 * - Dialog closes (onCancel called) on successful save
 * - Dialog does NOT close when onSave throws
 * - An error message is shown inside the dialog on failure
 * - Save button is disabled while submission is in-flight
 * - Save button re-enables after failure so the user can retry
 * - Error message is cleared when the user edits a field
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TicketEdit, { TicketEditValues } from "../components/TicketEdit";

const INITIAL: TicketEditValues = {
  id: "t1",
  name: "Oppenheimer",
  venue: "AMC Empire 25",
  eventDate: "2024-07-21",
  eventTime: "19:30",
  theater: "7",
  seat: "D4",
};

function submitForm() {
  fireEvent.click(screen.getByText("Save changes"));
}

describe("TicketEdit — error handling on save failure", () => {
  it("calls onCancel after a successful save", async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TicketEdit open initial={INITIAL} onCancel={onCancel} onSave={onSave} />);
    submitForm();
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
  });

  it("does NOT call onCancel when onSave throws", async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<TicketEdit open initial={INITIAL} onCancel={onCancel} onSave={onSave} />);
    submitForm();
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("shows an error alert inside the dialog when onSave throws", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<TicketEdit open initial={INITIAL} onCancel={vi.fn()} onSave={onSave} />);
    submitForm();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("disables the Save button while save is in-flight", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((r) => { resolve = r; });
    const onSave = vi.fn().mockReturnValue(pending);
    render(<TicketEdit open initial={INITIAL} onCancel={vi.fn()} onSave={onSave} />);
    submitForm();
    await waitFor(() => expect(screen.getByText("Saving…")).toBeDisabled());
    resolve();
  });

  it("re-enables the Save button after a failed save", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("fail"));
    render(<TicketEdit open initial={INITIAL} onCancel={vi.fn()} onSave={onSave} />);
    submitForm();
    await waitFor(() => expect(screen.getByText("Save changes")).not.toBeDisabled());
  });

  it("clears the error message when the user edits the name field", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("fail"));
    render(<TicketEdit open initial={INITIAL} onCancel={vi.fn()} onSave={onSave} />);
    submitForm();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue("Oppenheimer"), {
      target: { value: "Tenet" },
    });
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});
