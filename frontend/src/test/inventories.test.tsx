import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";
import InventoriesPage from "../pages/inventories";
import {
  getActiveInventory,
  listInventories,
} from "../services/inventoryService";

// Mock react-router navigate
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: () => ({ pathname: "/inventories", state: {} }),
}));

// Mock inventory service
jest.mock("../services/inventoryService", () => ({
  listInventories: jest.fn(),
  getActiveInventory: jest.fn(),
  setActiveInventory: jest.fn(),
}));

describe("InventoriesPage", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (getActiveInventory as jest.Mock).mockResolvedValue(null);
  });

  test("shows loading, then renders inventories list + CTAs", async () => {
    (listInventories as jest.Mock).mockResolvedValueOnce([
      { id: "1", name: "Ola AS", orgNumber: "123456789", role: "owner" },
      { id: "2", name: "Kari AS", orgNumber: "987654321", role: "employee" },
    ]);

    render(<InventoriesPage />);

    // loading state
    expect(screen.getByText(/loading inventories/i)).toBeInTheDocument();

    // list items render
    expect(await screen.findByText("Ola AS")).toBeInTheDocument();
    expect(screen.getByText(/org number:\s*123456789/i)).toBeInTheDocument();
    expect(screen.getByText("Kari AS")).toBeInTheDocument();
    expect(screen.getByText(/org number:\s*987654321/i)).toBeInTheDocument();

    // CTAs available
    const registerNew = screen.getByRole("button", { name: /register new/i });
    const backToDashboard = screen.getByRole("button", {
      name: /back to dashboard/i,
    });

    fireEvent.click(registerNew);
    expect(mockNavigate).toHaveBeenCalledWith(PATHS.INVENTORIES_NEW);

    fireEvent.click(backToDashboard);
    expect(mockNavigate).toHaveBeenCalledWith(PATHS.DASHBOARD);
  });

  test("empty list shows empty state message + CTAs", async () => {
    (listInventories as jest.Mock).mockResolvedValueOnce([]);

    render(<InventoriesPage />);

    expect(
      await screen.findByText(/no inventories to show yet/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /register new/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /back to dashboard/i }),
    ).toBeInTheDocument();
  });

  test("401/403 shows auth error and offers go to login", async () => {
    (listInventories as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(<InventoriesPage />);

    // error message
    expect(
      await screen.findByText(/authentication credentials were not provided/i),
    ).toBeInTheDocument();

    // unauthorized CTAs
    const goToLogin = screen.getByRole("button", { name: /go to login/i });
    fireEvent.click(goToLogin);

    expect(mockNavigate).toHaveBeenCalledWith(PATHS.HOME);
  });
});
