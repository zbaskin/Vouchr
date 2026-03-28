/**
 * Phase 4 styling cleanup tests.
 * Verify final cleanup: semantic token usage in Settings, LandingPage.css
 * deleted, global.css merged into index.css.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const root = resolve(__dirname, "../../../");
const src = resolve(root, "src");

function readSrc(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

// ─── Step 4a: Settings.tsx hardcoded colors replaced with semantic tokens ────

describe("Phase 4a – Settings.tsx uses semantic tokens", () => {
  it("Settings.tsx does not use text-gray-500", () => {
    const tsx = readSrc("components/Settings.tsx");
    expect(tsx).not.toContain("text-gray-500");
  });

  it("Settings.tsx does not use bg-gray-200", () => {
    const tsx = readSrc("components/Settings.tsx");
    expect(tsx).not.toContain("bg-gray-200");
  });

  it("Settings.tsx does not use bg-black (hardcoded)", () => {
    const tsx = readSrc("components/Settings.tsx");
    expect(tsx).not.toContain("bg-black");
  });
});

// ─── Step 4b: LandingPage ─────────────────────────────────────────────────────

describe("Phase 4b – LandingPage migrated", () => {
  it("LandingPage.css no longer exists", () => {
    expect(existsSync(resolve(src, "pages/LandingPage.css"))).toBe(false);
  });

  it("LandingPage.tsx does not import LandingPage.css", () => {
    const tsx = readSrc("pages/LandingPage.tsx");
    expect(tsx).not.toContain("LandingPage.css");
  });

  it("LandingPage.tsx does not use the .landingLogo class name", () => {
    const tsx = readSrc("pages/LandingPage.tsx");
    expect(tsx).not.toContain('"landingLogo"');
    expect(tsx).not.toContain("'landingLogo'");
  });

  it("LandingPage.tsx does not use the .landingTitle class name", () => {
    const tsx = readSrc("pages/LandingPage.tsx");
    expect(tsx).not.toContain('"landingTitle"');
    expect(tsx).not.toContain("'landingTitle'");
  });

  it("LandingPage.tsx does not use the .lpMenuPanel class name", () => {
    const tsx = readSrc("pages/LandingPage.tsx");
    expect(tsx).not.toContain("lpMenuPanel");
  });
});

// ─── Step 4c: global.css merged into index.css ───────────────────────────────

describe("Phase 4c – global.css merged into index.css", () => {
  it("global.css no longer exists", () => {
    expect(existsSync(resolve(src, "global.css"))).toBe(false);
  });

  it("main.tsx does not import global.css", () => {
    const tsx = readSrc("main.tsx");
    expect(tsx).not.toContain("global.css");
  });

  it("index.css contains the @font-face Arista declaration", () => {
    const css = readSrc("index.css");
    expect(css).toContain('@font-face');
    expect(css).toContain('font-family: "Arista"');
  });

  it("index.css contains the primary brand variable", () => {
    const css = readSrc("index.css");
    expect(css).toContain("--primary:");
  });

  it("index.css contains the .dark block", () => {
    const css = readSrc("index.css");
    expect(css).toContain(".dark {");
  });
});

// ─── No remaining per-component CSS imports ──────────────────────────────────

describe("Phase 4 – No remaining per-component CSS file imports", () => {
  const componentFiles = [
    "components/Ticket.tsx",
    "components/Navbar.tsx",
    "components/TicketCollection.tsx",
    "components/TicketForm.tsx",
    "components/Settings.tsx",
    "AppShell.tsx",
    "pages/LandingPage.tsx",
  ];

  for (const file of componentFiles) {
    it(`${file} has no .css import`, () => {
      if (!existsSync(resolve(src, file))) return; // file was deleted — pass
      const content = readSrc(file);
      // Match any import of a .css file (not node_modules stylesheet imports like react-datepicker/dist/...)
      const localCssImport = /import\s+["'][^"']*\.css["']/g;
      const matches = content.match(localCssImport) ?? [];
      // Allow third-party css (react-datepicker, @aws-amplify) — only block local .css
      const localOnly = matches.filter(
        (m) => !m.includes("node_modules") && !m.includes("react-datepicker") && !m.includes("@aws-amplify")
      );
      expect(localOnly).toHaveLength(0);
    });
  }
});
