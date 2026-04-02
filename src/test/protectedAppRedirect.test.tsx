/**
 * Tests for ProtectedApp auth-based routing.
 *
 * Original fix (Low Error #2): replaced <Authenticator> wrapper with
 * useAuthenticator + <Navigate to="/login"> so unauthenticated users always
 * reach the styled LoginPage.
 *
 * Regression (Error #6): that fix treated authStatus="configuring" the same as
 * "unauthenticated", immediately redirecting to /login. "configuring" is Amplify's
 * initial state while it resolves an existing session — navigating away causes a
 * redirect loop: /app → /login → /app → /login …
 *
 * Fix: render a blank loading placeholder for "configuring" and only redirect
 * to /login for "unauthenticated".
 *
 * Covers:
 * - "unauthenticated" → redirects to /login
 * - "configuring" → shows loading placeholder (neither login nor AppShell)
 * - "authenticated" → renders AppShell, stays at /app
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";

const mockUseAuthenticator = vi.fn();

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: (...args: any[]) => mockUseAuthenticator(...args),
}));

vi.mock("@aws-amplify/ui-react/styles.css", () => ({}));
vi.mock("aws-amplify/auth", () => ({ signOut: vi.fn() }));

// Stub out AppShell so the test doesn't pull in the whole auth/ticket stack
vi.mock("../AppShell", () => ({
  default: () => <div data-testid="app-shell" />,
}));

import ProtectedApp from "../pages/ProtectedApp";

function renderProtectedApp() {
  render(
    <MemoryRouter initialEntries={["/app/collection"]}>
      <Routes>
        <Route path="/app/*" element={<ProtectedApp />}>
          <Route path="collection" element={<div data-testid="collection" />} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuthenticator.mockReturnValue({ authStatus: "authenticated" });
});

describe("ProtectedApp — auth-based routing", () => {
  it("redirects to /login when authStatus is 'unauthenticated'", () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: "unauthenticated" });
    renderProtectedApp();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("app-shell")).not.toBeInTheDocument();
  });

  it("shows a blank loading state when authStatus is 'configuring' (no redirect)", () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: "configuring" });
    renderProtectedApp();
    // Must NOT redirect to login — that would start a redirect loop
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
    // Must NOT show AppShell prematurely either
    expect(screen.queryByTestId("app-shell")).not.toBeInTheDocument();
  });

  it("does not redirect to /login while auth is still initializing", () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: "configuring" });
    renderProtectedApp();
    // URL must still be /app/collection, not /login
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });

  it("renders AppShell when authStatus is 'authenticated'", () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: "authenticated" });
    renderProtectedApp();
    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
