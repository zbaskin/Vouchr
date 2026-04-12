/**
 * Tests for the custom desktop Sort dropdown in Navbar.
 *
 * The desktop Sort control is a styled button + floating listbox — not a
 * native <select> — so the options can be themed to match the rest of the UI.
 *
 * Covers:
 * - Sort button renders with visible "Sort" text
 * - Clicking the button opens the option panel
 * - Panel contains all three sort options
 * - Selecting an option calls onChangeSort with the right value
 * - Selecting an option closes the panel
 * - The currently-active sort option is marked aria-selected="true"
 * - Pressing Escape closes the panel without calling onChangeSort
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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
  isMobile: false,
  sortType: SortType.TIME_CREATED,
  onChangeSort: vi.fn(),
  onSignOut: vi.fn(),
  ticketCount: 5,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Navbar — desktop sort dropdown", () => {
  it("renders a Sort button with visible text", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument();
  });

  it("dropdown panel is not visible before the button is clicked", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clicking the Sort button opens the dropdown panel", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("dropdown panel shows all three sort options", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Event Date")).toBeInTheDocument();
    expect(screen.getByText("Title A–Z")).toBeInTheDocument();
  });

  it("clicking an option calls onChangeSort with the correct SortType", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    fireEvent.click(screen.getByText("Event Date"));
    expect(defaultProps.onChangeSort).toHaveBeenCalledWith(SortType.EVENT_DATE);
  });

  it("clicking an option closes the dropdown panel", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    fireEvent.click(screen.getByText("Newest"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("the active sort option has aria-selected='true'", () => {
    render(<Navbar {...defaultProps} sortType={SortType.ALPHABETICAL} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    const activeOption = screen.getByRole("option", { name: "Title A–Z" });
    expect(activeOption.getAttribute("aria-selected")).toBe("true");
  });

  it("non-active options have aria-selected='false'", () => {
    render(<Navbar {...defaultProps} sortType={SortType.TIME_CREATED} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    expect(screen.getByRole("option", { name: "Event Date" }).getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("option", { name: "Title A–Z" }).getAttribute("aria-selected")).toBe("false");
  });

  it("pressing Escape closes the dropdown without calling onChangeSort", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(defaultProps.onChangeSort).not.toHaveBeenCalled();
  });
});
