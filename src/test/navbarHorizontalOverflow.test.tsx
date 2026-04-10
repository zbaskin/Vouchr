/**
 * Regression guard: the Navbar must not use w-screen (100vw) on its root element.
 *
 * w-screen = 100vw, which includes the vertical scrollbar gutter (~15 px).
 * On any page with vertical scroll, w-screen > available content width,
 * which creates a persistent horizontal scrollbar.
 *
 * The correct approach is w-full (100% of the parent), which is bounded by
 * the actual content area and never causes overflow.
 */

import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

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

const baseProps = {
  sortType: SortType.TIME_CREATED,
  onChangeSort: vi.fn(),
  onSignOut: vi.fn(),
};

describe("Navbar — no horizontal overflow", () => {
  it("desktop root element uses w-full, not w-screen", () => {
    render(<Navbar {...baseProps} isMobile={false} />);
    const root = document.querySelector("div[class*='bg-primary']");
    expect(root).not.toBeNull();
    expect(root!.className).not.toContain("w-screen");
    expect(root!.className).toContain("w-full");
  });

  it("mobile root element uses w-full, not w-screen", () => {
    render(<Navbar {...baseProps} isMobile={true} />);
    const root = document.querySelector("div[class*='bg-primary']");
    expect(root).not.toBeNull();
    expect(root!.className).not.toContain("w-screen");
    expect(root!.className).toContain("w-full");
  });

  it("root element does not use negative-margin full-bleed escape (ml-[calc(50%-50vw)])", () => {
    render(<Navbar {...baseProps} isMobile={false} />);
    const root = document.querySelector("div[class*='bg-primary']");
    expect(root!.className).not.toContain("50vw");
  });
});
