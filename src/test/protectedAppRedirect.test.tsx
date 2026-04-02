/**
 * Tests for Low Error #2 — two separate <Authenticator> surfaces produce
 * inconsistent auth UX.
 *
 * Root cause: ProtectedApp wraps AppShell in <Authenticator> (a gating component).
 * When an unauthenticated user navigates to /app, they see an inline Amplify
 * sign-in form with no Navbar or app branding — a completely different surface
 * from the intentional LoginPage at /login that has its own styled layout.
 *
 * Fix:
 * - Replace the <Authenticator> wrapper in ProtectedApp with a useAuthenticator
 *   hook check: redirect to /login when not authenticated, render AppShell when
 *   authenticated.
 * - main.tsx already provides <Authenticator.Provider> as context, so the hook
 *   works without any extra wrapper.
 *
 * Covers:
 * - Unauthenticated users are redirected to /login (not shown an inline form)
 * - Authenticated users see AppShell as before
 * - Configuring state stays at /login while not authenticated
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

  it("redirects to /login when authStatus is 'configuring'", () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: "configuring" });
    renderProtectedApp();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("renders AppShell when authStatus is 'authenticated'", () => {
    mockUseAuthenticator.mockReturnValue({ authStatus: "authenticated" });
    renderProtectedApp();
    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
