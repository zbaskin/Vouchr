/**
 * Tests for Error #1 — Settings "Save preference" does not update AppShell sort state.
 *
 * Root cause: Settings.handleSaveSort called updateSortType + setSearchParams but
 * never called AppShell's setSortType. AppShell's ticket-sort effect only re-runs
 * when sortType state changes, so the visible ticket order was frozen after save.
 *
 * Fix: expose onChangeSort in AppOutletContext; Settings delegates to it on save
 * instead of independently calling updateSortType + setSearchParams.
 *
 * Covers:
 * - Clicking "Save preference" calls onChangeSort with the selected sort value
 * - onChangeSort is called exactly once on save
 * - Default selected sort is reflected in the radio buttons
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Settings from "../components/Settings";
import type { AppOutletContext } from "../AppShell";
import { SortType } from "../API";

// Mock ticketService — Settings should no longer call updateSortType directly
vi.mock("../ticketService", () => ({
  fetchSortType: vi.fn().mockResolvedValue("TIME_CREATED"),
  updateSortType: vi.fn().mockResolvedValue(undefined),
}));

// Stub Outlet context
function renderSettings(contextOverrides: Partial<AppOutletContext> = {}) {
  const defaultCtx: AppOutletContext = {
    tickets: [],
    isLoading: false,
    isMobile: false,
    ticketCollection: "col-1",
    handleAddTicket: vi.fn(),
    handleRemoveTicket: vi.fn(),
    handleEditTicket: vi.fn(),
    onChangeSort: vi.fn(),
    ...contextOverrides,
  };

  // Use a wrapper route that injects the outlet context
  const Wrapper = () => {
    const { Outlet } = require("react-router-dom");
    return <Outlet context={defaultCtx} />;
  };

  render(
    <MemoryRouter initialEntries={["/?sort=TIME_CREATED"]}>
      <Routes>
        <Route element={<Wrapper />}>
          <Route path="/" element={<Settings />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  return defaultCtx;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Settings — sort save calls onChangeSort", () => {
  it("calls onChangeSort with selected sort when Save preference is clicked", async () => {
    const ctx = renderSettings();

    // Wait for loading to finish
    await waitFor(() =>
      expect(screen.getByLabelText(/event date/i)).toBeInTheDocument()
    );

    // Switch selection to EVENT_DATE
    fireEvent.click(screen.getByLabelText(/event date/i));

    // Click save
    fireEvent.click(screen.getByRole("button", { name: /save preference/i }));

    await waitFor(() => {
      expect(ctx.onChangeSort).toHaveBeenCalledTimes(1);
      expect(ctx.onChangeSort).toHaveBeenCalledWith(SortType.EVENT_DATE);
    });
  });

  it("calls onChangeSort with ALPHABETICAL when alphabetical is selected and saved", async () => {
    const ctx = renderSettings();

    await waitFor(() =>
      expect(screen.getByLabelText(/alphabetical/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText(/alphabetical/i));
    fireEvent.click(screen.getByRole("button", { name: /save preference/i }));

    await waitFor(() => {
      expect(ctx.onChangeSort).toHaveBeenCalledWith(SortType.ALPHABETICAL);
    });
  });

  it("calls onChangeSort with TIME_CREATED when saving the default selection", async () => {
    const ctx = renderSettings();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /save preference/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /save preference/i }));

    await waitFor(() => {
      expect(ctx.onChangeSort).toHaveBeenCalledWith(SortType.TIME_CREATED);
    });
  });

  it("save is synchronous — button label stays 'Save preference' after click", async () => {
    // onChangeSort is synchronous; no loading state needed
    const ctx = renderSettings();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /save preference/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /save preference/i }));

    // Button should still read "Save preference" (no async loading state)
    expect(screen.getByRole("button", { name: /save preference/i })).toBeInTheDocument();
    expect(ctx.onChangeSort).toHaveBeenCalledTimes(1);
  });
});
