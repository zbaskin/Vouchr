/**
 * Tests for MEDIUM Error #7 — LoginPage drops ?sort= param on auth redirect.
 *
 * Root cause: `navigate('/app/collection', { replace: true })` hard-codes a
 * path with no query string. After authentication the user lands on
 * /app/collection with no ?sort= param. AppShell's sort-init effect then makes
 * an async network round-trip to fetchSortType instead of using a URL value,
 * causing a brief spinner and unnecessary latency.
 *
 * Fix: navigate to '/app/collection?sort=TIME_CREATED' so AppShell can
 * short-circuit the fetchSortType call and tickets load immediately.
 *
 * Covers:
 * - Redirect URL includes a ?sort= query param
 * - Default sort value is TIME_CREATED (the app-wide fallback)
 * - No redirect while authStatus is 'configuring'
 * - No redirect while authStatus is 'unauthenticated'
 * - Redirect is called with replace: true (no back-button loop)
 */

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(),
  Authenticator: () => <div data-testid="authenticator" />,
}));

vi.mock("@aws-amplify/ui-react/styles.css", () => ({}));

import { useAuthenticator } from "@aws-amplify/ui-react";

async function renderLoginPage(authStatus: string) {
  (useAuthenticator as ReturnType<typeof vi.fn>).mockReturnValue({ authStatus });
  const { default: LoginPage } = await import("../pages/LoginPage");
  render(<LoginPage />);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("LoginPage — auth redirect includes sort param", () => {
  it("navigates to a URL containing ?sort= when authenticated", async () => {
    await renderLoginPage("authenticated");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const [path] = mockNavigate.mock.calls[0];
    expect(path).toMatch(/\?sort=/);
  });

  it("default sort value is TIME_CREATED", async () => {
    await renderLoginPage("authenticated");
    const [path] = mockNavigate.mock.calls[0];
    expect(path).toContain("sort=TIME_CREATED");
  });

  it("uses replace: true to prevent back-button loop", async () => {
    await renderLoginPage("authenticated");
    const [, options] = mockNavigate.mock.calls[0];
    expect(options?.replace).toBe(true);
  });

  it("does not redirect while authStatus is 'configuring'", async () => {
    await renderLoginPage("configuring");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not redirect while authStatus is 'unauthenticated'", async () => {
    await renderLoginPage("unauthenticated");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
