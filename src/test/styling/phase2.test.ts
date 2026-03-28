/**
 * Phase 2 styling cleanup tests.
 * Verify that simpler components have been migrated to Tailwind and their
 * per-component CSS files deleted.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const root = resolve(__dirname, "../../../");
const src = resolve(root, "src");

function readSrc(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

// ─── Step 2a: TicketCollection ───────────────────────────────────────────────

describe("Phase 2a – TicketCollection migrated", () => {
  it("TicketCollection.css no longer exists", () => {
    expect(existsSync(resolve(src, "components/TicketCollection.css"))).toBe(false);
  });

  it("TicketCollection.tsx does not import TicketCollection.css", () => {
    const tsx = readSrc("components/TicketCollection.tsx");
    expect(tsx).not.toContain("TicketCollection.css");
  });

  it("TicketCollection.tsx uses w-[1000px] for desktop width", () => {
    const tsx = readSrc("components/TicketCollection.tsx");
    expect(tsx).toContain("w-[1000px]");
  });

  it("TicketCollection.tsx uses w-[410px] for mobile width", () => {
    const tsx = readSrc("components/TicketCollection.tsx");
    expect(tsx).toContain("w-[410px]");
  });
});

// ─── Step 2b: TicketForm ─────────────────────────────────────────────────────

describe("Phase 2b – TicketForm migrated", () => {
  it("TicketForm.css no longer exists", () => {
    expect(existsSync(resolve(src, "components/TicketForm.css"))).toBe(false);
  });

  it("TicketForm.tsx does not import TicketForm.css", () => {
    const tsx = readSrc("components/TicketForm.tsx");
    expect(tsx).not.toContain("TicketForm.css");
  });

  it("TicketForm.tsx does not use style={{ gridColumn: '1 / -1' }}", () => {
    const tsx = readSrc("components/TicketForm.tsx");
    // Should be replaced with col-span-full
    expect(tsx).not.toContain('gridColumn: "1 / -1"');
    expect(tsx).not.toContain("gridColumn: '1 / -1'");
  });

  it("TicketForm.tsx uses col-span-full instead of inline gridColumn", () => {
    const tsx = readSrc("components/TicketForm.tsx");
    expect(tsx).toContain("col-span-full");
  });
});

// ─── Step 2c: AppShell ───────────────────────────────────────────────────────

describe("Phase 2c – AppShell migrated", () => {
  it("AppShell.css no longer exists", () => {
    expect(existsSync(resolve(src, "AppShell.css"))).toBe(false);
  });

  it("AppShell.tsx does not import AppShell.css", () => {
    const tsx = readSrc("AppShell.tsx");
    expect(tsx).not.toContain("AppShell.css");
  });
});
