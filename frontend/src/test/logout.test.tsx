// @ts-expect-error: jsdom polyfill
import { TextDecoder, TextEncoder } from "node:util";

// @ts-expect-error: jsdom polyfill
global.TextEncoder = TextEncoder;
// @ts-expect-error: jsdom polyfill
global.TextDecoder = TextDecoder;

import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PATHS } from "../App";
import Navbar from "../components/navbar/topbar";
import apiClient from "../services/apiClient.ts";
import {
  checkSession,
  getCurrentUser,
  redirectToUrl,
} from "../services/authService";
import { getActiveInventory } from "../services/inventoryService";
import { LightTheme } from "../theme";

const mockNavigate = jest.fn();

jest.mock("../services/apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../services/authService", () => ({
  __esModule: true,
  checkSession: jest.fn(),
  getCurrentUser: jest.fn(),
  startSocialLogin: jest.fn(),
  redirectToUrl: jest.fn(),
}));

jest.mock("../services/inventoryService");

jest.mock("@mui/material/Menu", () => {
  return ({ children, open }: any) => (open ? <div>{children}</div> : null);
});

describe("Logout Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "";

    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      picture: null,
    });
  });

  const renderNavbar = () =>
    render(
      <ThemeProvider theme={LightTheme}>
        <MemoryRouter>
          <Navbar mode="light" setMode={jest.fn()} />
        </MemoryRouter>
      </ThemeProvider>,
    );

  test("Ensure session is clear", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    (apiClient.post as jest.Mock).mockImplementation(async () => {
      document.cookie =
        "inventoryToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return {
        status: 200,
        data: { logout_url: null },
      };
    });

    document.cookie = "inventoryToken=12345fake; path=/";
    expect(document.cookie).toContain("inventoryToken");

    renderNavbar();

    const userMenuButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });
    fireEvent.click(userMenuButton);

    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(document.cookie).toBe("");
    });

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.LOGIN, { replace: true });
  });

  test("Logout button is visible when session exists", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar();

    const userMenuButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });
    fireEvent.click(userMenuButton);

    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    expect(logoutBtn).toBeInTheDocument();
  });

  test("Logout sends request to server", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    (apiClient.post as jest.Mock).mockResolvedValue({
      status: 200,
      data: { logout_url: null },
    });

    renderNavbar();

    const userMenuButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });
    fireEvent.click(userMenuButton);

    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/api/user/logout/");
    });
  });

  test("Redirects to Auth0 logout url when backend returns logout_url", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    const auth0LogoutUrl = "https://example-auth0.com/v2/logout?client_id=test";

    (apiClient.post as jest.Mock).mockResolvedValue({
      status: 200,
      data: { logout_url: auth0LogoutUrl },
    });

    renderNavbar();

    const userMenuButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });
    fireEvent.click(userMenuButton);

    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(redirectToUrl).toHaveBeenCalledWith(auth0LogoutUrl);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
