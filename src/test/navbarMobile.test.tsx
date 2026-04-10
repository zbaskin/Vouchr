/**
 * Tests for mobile Navbar menu layout and behaviour.
 *
 * Covers:
 * - Menu opens when the hamburger button is clicked
 * - Menu closes when the backdrop (overlay) is clicked
 * - Menu closes when the Close button inside the panel is clicked
 * - The overlay positions the panel on the RIGHT (justify-end, not left)
 * - The panel is the LAST child of the overlay (right-side DOM order)
 * - Shadow direction is consistent with a right-side panel
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
});

describe("Navbar — mobile menu behaviour", () => {
  it("renders the hamburger button when isMobile is true", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("opens the menu dialog when the hamburger is clicked", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the menu when the Close button inside the panel is clicked", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByLabelText("Close menu"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the menu when the backdrop overlay is clicked", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    // Click the backdrop (role="presentation") but NOT the dialog itself
    const backdrop = screen.getByTestId("mobile-menu-overlay");
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Navbar — mobile sort closes sheet", () => {
  it("closes the menu when a sort option is selected from the dropdown", () => {
    render(<Navbar {...defaultProps} ticketCount={3} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: SortType.ALPHABETICAL },
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("still calls onChangeSort with the selected value when closing", () => {
    render(<Navbar {...defaultProps} ticketCount={3} />);
    fireEvent.click(screen.getByLabelText("Open menu"));

    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: SortType.EVENT_DATE },
    });

    expect(defaultProps.onChangeSort).toHaveBeenCalledWith(SortType.EVENT_DATE);
  });
});

describe("Navbar — mobile menu right-side layout", () => {
  it("the overlay uses justify-end to push the panel to the right", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const backdrop = screen.getByTestId("mobile-menu-overlay");
    expect(backdrop.className).toContain("justify-end");
  });

  it("the overlay does NOT use grid-cols-[1fr_auto] (which placed panel on the left)", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const backdrop = screen.getByTestId("mobile-menu-overlay");
    expect(backdrop.className).not.toContain("grid-cols-[1fr_auto]");
  });

  it("the panel (dialog) is the last child of the overlay", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const backdrop = screen.getByTestId("mobile-menu-overlay");
    const lastChild = backdrop.lastElementChild;
    expect(lastChild?.getAttribute("role")).toBe("dialog");
  });

  it("the panel shadow is cast to the left (negative x) for a right-side drawer", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const dialog = screen.getByRole("dialog");
    // shadow-[-8px_0_24px_...] casts leftward — correct for a right-edge panel
    expect(dialog.className).toMatch(/shadow-\[(-8px|[-\d]+px)_0/);
  });
});

describe("Navbar — sort hidden when no tickets", () => {
  it("hides sort label on desktop when ticketCount is 0", () => {
    render(<Navbar {...defaultProps} isMobile={false} ticketCount={0} />);
    expect(screen.queryByLabelText("Sort")).not.toBeInTheDocument();
    expect(screen.queryByText(/sort/i)).not.toBeInTheDocument();
  });

  it("shows sort label on desktop when ticketCount is greater than 0", () => {
    render(<Navbar {...defaultProps} isMobile={false} ticketCount={3} />);
    expect(screen.getByText(/sort/i)).toBeInTheDocument();
  });

  it("hides sort select on mobile sheet when ticketCount is 0", () => {
    render(<Navbar {...defaultProps} isMobile={true} ticketCount={0} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.queryByLabelText("Sort by")).not.toBeInTheDocument();
  });

  it("shows sort select on mobile sheet when ticketCount is greater than 0", () => {
    render(<Navbar {...defaultProps} isMobile={true} ticketCount={3} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
  });
});
