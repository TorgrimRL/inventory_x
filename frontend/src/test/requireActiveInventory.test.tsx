import { render, screen, waitFor } from "@testing-library/react";

import { PATHS } from "../App.tsx";
import RequireActiveInventory from "../components/inventory/requireActiveInventory";
import { getActiveInventory } from "../services/inventoryService";

const mockNav = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNav,
  useLocation: () => ({ pathname: "/dashboard" }),
}));

jest.mock("../services/inventoryService", () => ({
  getActiveInventory: jest.fn(),
}));

describe("RequireActiveInventory", () => {
  beforeEach(() => {
    mockNav.mockClear();
    (getActiveInventory as jest.Mock).mockReset();
  });

  it("redirects to /inventories with needChoice when no active inventory", async () => {
    (getActiveInventory as jest.Mock).mockResolvedValue(null);

    render(
      <RequireActiveInventory>
        <div>Protected</div>
      </RequireActiveInventory>,
    );

    expect(screen.getByText(/Checking active inventory/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith(PATHS.INVENTORIES, {
        replace: true,
        state: { needChoice: true, from: "/dashboard" },
      });
    });
  });

  it("renders children when active inventory exists", async () => {
    (getActiveInventory as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Acme",
      orgNumber: "123",
      role: "owner",
    });

    render(
      <RequireActiveInventory>
        <div>Protected</div>
      </RequireActiveInventory>,
    );

    await waitFor(() => {
      expect(screen.getByText("Protected")).toBeInTheDocument();
    });

    expect(mockNav).not.toHaveBeenCalled();
  });
  it("redirects to /inventories with needChoice when stale/invalid session (409)", async () => {
    (getActiveInventory as jest.Mock).mockRejectedValue({
      response: { status: 409 },
    });

    render(
      <RequireActiveInventory>
        <div>Protected</div>
      </RequireActiveInventory>,
    );

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith(PATHS.INVENTORIES, {
        replace: true,
        state: { needChoice: true, from: "/dashboard" },
      });
    });
  });
});
