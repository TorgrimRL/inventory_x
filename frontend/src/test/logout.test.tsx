// @ts-expect-error: None
import { TextDecoder, TextEncoder } from "util";
// @ts-expect-error: None
global.TextEncoder = TextEncoder;
// @ts-expect-error: None
global.TextDecoder = TextDecoder;

import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { PATHS } from "../App";
import Navbar from "../components/navbar/topbar";
import apiClient from "../services/apiClient.ts";
import { checkSession } from "../services/authService";
import { getActiveInventory } from "../services/inventoryService";
import { LightTheme } from "../theme";

// MOCK DEPENDENCIES
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
jest.mock("../services/authService");
jest.mock("../services/inventoryService");

describe("Logout Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "";
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  /* Helper render */
  const renderNavbar = () =>
    render(
      <ThemeProvider theme={LightTheme}>
        <MemoryRouter>
          <Navbar mode="light" setMode={jest.fn()} />
        </MemoryRouter>
      </ThemeProvider>,
    );

  test("Ensure session is clear", async () => {
    // MOCK session
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    // Simulate server response. [200](POST)
    (apiClient.post as jest.Mock).mockImplementation(async () => {
      document.cookie =
        "inventoryToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return { status: 200 };
    });

    document.cookie = "inventoryToken=12345fake; path=/";
    expect(document.cookie).toContain("inventoryToken");

    renderNavbar();
    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    fireEvent.click(logoutBtn);

    // VERIFICATION
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
    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    expect(logoutBtn).toBeInTheDocument();
  });

  test("Logout sends request to server", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    (apiClient.post as jest.Mock).mockResolvedValue({ status: 200 });

    renderNavbar();
    const logoutBtn = await screen.findByRole("button", { name: /log out/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });
  });
});
