/**
 * Tests for LOW Error #8 — Navbar body scroll-lock captures stale `overflow`
 * on cleanup.
 *
 * Root cause: the effect always runs its full body (capturing `prev`) even when
 * `open=false`, so the cleanup from the open=false run fires right before the
 * open=true run. If something changed `style.overflow` between those two renders
 * (e.g., another modal), that external value gets overwritten by the stale `prev`.
 *
 * Fix: guard with `if (!open) return;` so `prev` is only captured when we're
 * actually setting `"hidden"`, and cleanup only fires when we made a change.
 *
 * Covers:
 * - body.style.overflow is "hidden" while the mobile menu is open
 * - body.style.overflow is restored to its value at the moment the menu opened
 *   (not to the stale value captured on the very first render)
 * - body.style.overflow is not touched when the menu is never opened
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useLocation: () => ({ pathname: "/app/collection" }),
    NavLink: ({ children, className, onClick }: any) => (
      <a onClick={onClick} className={typeof className === "function" ? className({ isActive: false }) : className}>
        {children}
      </a>
    ),
    createSearchParams: (p: any) => new URLSearchParams(p),
    matchPath: () => null,
  };
});

import Navbar from "../components/Navbar";
import { SortType } from "../API";

const defaultProps = {
  isMobile: true,
  sortType: SortType.TIME_CREATED,
  onChangeSort: vi.fn(),
  onSignOut: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  document.body.style.overflow = "";
});

afterEach(() => {
  document.body.style.overflow = "";
});

describe("Navbar — body scroll-lock", () => {
  it("sets body overflow to 'hidden' when the mobile menu is open", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow to '' when the menu is closed", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(within(screen.getByRole("dialog")).getByLabelText("Close menu"));
    expect(document.body.style.overflow).toBe("");
  });

  it("restores to an externally-set overflow value that was present when the menu opened — not a stale captured value", () => {
    // Simulate another component having set overflow before the menu opens
    render(<Navbar {...defaultProps} />);
    // Set overflow AFTER mount (simulating an external change after first render)
    document.body.style.overflow = "auto";
    // Now open the menu — prev should be captured as "auto", NOT ""
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(document.body.style.overflow).toBe("hidden");
    // Close — should restore "auto", not the stale ""
    fireEvent.click(within(screen.getByRole("dialog")).getByLabelText("Close menu"));
    expect(document.body.style.overflow).toBe("auto");
  });

  it("does not touch body overflow when the menu is never opened", () => {
    document.body.style.overflow = "scroll";
    render(<Navbar {...defaultProps} />);
    // Don't open the menu
    expect(document.body.style.overflow).toBe("scroll");
  });
});
