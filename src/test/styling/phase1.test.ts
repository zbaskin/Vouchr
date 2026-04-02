/**
 * Phase 1 styling cleanup tests.
 * These tests assert the structural outcome of the foundation cleanup —
 * they do NOT compile or run components; they just inspect file contents
 * and config exports.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const root = resolve(__dirname, "../../../");
const src = resolve(root, "src");

// ─── helpers ──────────────────────────────────────────────────────────────────

function readSrc(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

function countMatches(text: string, re: RegExp) {
  return (text.match(re) ?? []).length;
}

// ─── Step 1a: global.css had exactly ONE :root block (now merged into index.css) ─

describe("Phase 1a – global.css :root consolidation", () => {
  // global.css may be fully merged into index.css by Phase 4c (also acceptable).
  // In that final state, index.css carries the tokens and global.css is gone.
  const globalCssPath = resolve(src, "global.css");
  const globalExists = existsSync(globalCssPath);
  const indexCss = readFileSync(resolve(src, "index.css"), "utf8");

  it("if global.css still exists, it has exactly one :root block", () => {
    if (!globalExists) return;
    const css = readFileSync(globalCssPath, "utf8");
    const rootCount = countMatches(css, /^:root\s*\{/gm);
    expect(rootCount).toBe(1);
  });

  it("if global.css still exists, it does NOT reference --app-background or --app-foreground", () => {
    if (!globalExists) return;
    const css = readFileSync(globalCssPath, "utf8");
    expect(css).not.toContain("--app-background");
    expect(css).not.toContain("--app-foreground");
  });

  it("the .dark block exists in global.css or index.css", () => {
    if (globalExists) {
      const css = readFileSync(globalCssPath, "utf8");
      expect(css).toContain(".dark {");
    } else {
      expect(indexCss).toContain(".dark {");
    }
  });

  it("core brand variables exist in global.css or index.css", () => {
    const source = globalExists ? readFileSync(globalCssPath, "utf8") : indexCss;
    expect(source).toContain("--primary:");
    expect(source).toContain("--secondary:");
    expect(source).toContain("--background:");
    expect(source).toContain("--copy:");
  });

  it("index.css does NOT reference --app-background or --app-foreground", () => {
    expect(indexCss).not.toContain("--app-background");
    expect(indexCss).not.toContain("--app-foreground");
  });
});

// ─── Step 1b: App.css is gone ────────────────────────────────────────────────

describe("Phase 1b – App.css deleted", () => {
  it("App.css does not exist", () => {
    expect(existsSync(resolve(src, "App.css"))).toBe(false);
  });

  it("App.tsx does not import App.css", () => {
    const tsx = readSrc("App.tsx");
    expect(tsx).not.toContain("App.css");
  });
});

// ─── Step 1c: dead CSS removed from AppShell.css ─────────────────────────────

describe("Phase 1c – AppShell.css dead classes removed", () => {
  // AppShell.css may be fully deleted by Phase 2c (also acceptable).
  const cssPath = resolve(src, "AppShell.css");
  const cssExists = existsSync(cssPath);

  it("if AppShell.css exists, .title class is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.title\s*\{/m);
  });

  it("if AppShell.css exists, .signoutButton class is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.signoutButton\s*\{/m);
  });

  it("if AppShell.css exists, .sortButtonContainer class is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.sortButtonContainer\s*\{/m);
  });

  it("if AppShell.css exists, .sortButton class is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.sortButton\s*\{/m);
  });
});

// ─── Step 1d: dead CSS removed from TicketForm.css ───────────────────────────

describe("Phase 1d – TicketForm.css legacy rules removed", () => {
  // TicketForm.css may be fully deleted by Phase 2 (also acceptable — dead code
  // is certainly gone if the file itself no longer exists).
  const cssPath = resolve(src, "components/TicketForm.css");
  const cssExists = existsSync(cssPath);

  it("if TicketForm.css exists, it has no legacy max-width/min-width from old .ticketInputContainer", () => {
    if (!cssExists) return; // file deleted — trivially passes
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toContain("max-width: 250px");
    expect(css).not.toContain("min-width: 250px");
  });

  it("if TicketForm.css exists, legacy .ticketInput definition is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.ticketInput\s*\{/m);
  });

  it("if TicketForm.css exists, legacy .ticketInputSmall definition is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.ticketInputSmall\s*\{/m);
  });

  it("if TicketForm.css exists, legacy .createTicketButton definition is removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toMatch(/^\.createTicketButton\s*\{/m);
  });

  it("if TicketForm.css exists, 'all: unset' reset rules are removed", () => {
    if (!cssExists) return;
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toContain("all: unset");
  });
});

// ─── Step 1e: tailwind.config.js semantic color tokens ───────────────────────

describe("Phase 1e – tailwind.config.js semantic color tokens", () => {
  it("exports semantic color names mapped to CSS variables", async () => {
    // Dynamically import the config to test its shape
    const configPath = resolve(root, "tailwind.config.js");
    const mod = await import(/* @vite-ignore */ configPath + `?t=${Date.now()}`);
    const config = mod.default ?? mod;

    const colors = config?.theme?.extend?.colors ?? {};

    expect(colors.primary).toBe("var(--primary)");
    expect(colors["primary-dark"]).toBe("var(--primary-dark)");
    expect(colors["primary-light"]).toBe("var(--primary-light)");
    expect(colors["primary-content"]).toBe("var(--primary-content)");
    expect(colors.secondary).toBe("var(--secondary)");
    expect(colors["secondary-content"]).toBe("var(--secondary-content)");
    expect(colors.background).toBe("var(--background)");
    expect(colors.foreground).toBe("var(--foreground)");
    expect(colors.border).toBe("var(--border)");
    expect(colors.copy).toBe("var(--copy)");
    expect(colors["copy-light"]).toBe("var(--copy-light)");
    expect(colors["copy-lighter"]).toBe("var(--copy-lighter)");
  });
});
