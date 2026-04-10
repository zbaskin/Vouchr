/**
 * Phase 3 styling cleanup tests.
 * Verify that complex components Ticket and Navbar have been migrated to
 * Tailwind and their per-component CSS files deleted.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const src = resolve(__dirname, "../../../src");

function readSrc(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

// ─── Step 3a: Ticket ─────────────────────────────────────────────────────────

describe("Phase 3a – Ticket migrated", () => {
  it("Ticket.css no longer exists", () => {
    expect(existsSync(resolve(src, "components/Ticket.css"))).toBe(false);
  });

  it("Ticket.tsx does not import Ticket.css", () => {
    const tsx = readSrc("components/Ticket.tsx");
    expect(tsx).not.toContain("Ticket.css");
  });

  it("Ticket.tsx retains inline style for popover positioning (top/left/transform)", () => {
    const tsx = readSrc("components/Ticket.tsx");
    // Runtime-computed values must stay as inline style
    expect(tsx).toContain("popoverPos.top");
    expect(tsx).toContain("popoverPos.left");
    expect(tsx).toContain("translateX(-50%) translateY(-100%)");
  });
});

// ─── Step 3b: Navbar ─────────────────────────────────────────────────────────

describe("Phase 3b – Navbar migrated", () => {
  it("Navbar.css no longer exists", () => {
    expect(existsSync(resolve(src, "components/Navbar.css"))).toBe(false);
  });

  it("Navbar.tsx does not import Navbar.css", () => {
    const tsx = readSrc("components/Navbar.tsx");
    expect(tsx).not.toContain("Navbar.css");
  });

  it("Navbar.tsx uses w-full (not w-screen) to avoid horizontal overflow from scrollbar gutter", () => {
    const tsx = readSrc("components/Navbar.tsx");
    expect(tsx).toContain("w-full");
    expect(tsx).not.toContain("w-screen");
  });

  it("Navbar.tsx does not use negative-margin full-bleed escape (50vw)", () => {
    const tsx = readSrc("components/Navbar.tsx");
    expect(tsx).not.toContain("50vw");
  });
});
