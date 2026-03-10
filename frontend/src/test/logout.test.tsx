import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

import { PATHS } from "../App";
import Dashboard from "../pages/dashboard";
import { checkSession } from "../services/authService";

// MOCK DEPENDENCIES
const mockNavigate = jest.fn();
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
jest.mock("../services/authService");

describe("Logout Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "";
  });

  test("Ensure session is clear", async () => {
    // MOCK session
    (checkSession as jest.Mock).mockResolvedValue(true);

    // Simulate server response. [200](POST)
    (axios.post as jest.Mock).mockImplementation(async () => {
      document.cookie =
        "inventoryToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return { status: 200 };
    });

    document.cookie = "inventoryToken=12345fake; path=/";
    expect(document.cookie).toContain("inventoryToken");

    render(<Dashboard />);
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

    render(<Dashboard />);

    const logoutBtn = await screen.findByRole("button", { name: /log out/i });

    expect(logoutBtn).toBeInTheDocument();
  });

  test("Logout sends request to server", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);

    (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

    render(<Dashboard />);

    const logoutBtn = await screen.findByRole("button", { name: /log out/i });

    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
