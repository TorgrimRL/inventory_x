// @ts-expect-error: None
import { TextDecoder, TextEncoder } from "util";
// @ts-expect-error: None
global.TextEncoder = TextEncoder;
// @ts-expect-error: None
global.TextDecoder = TextDecoder;
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Navbar from "../components/navbar/topbar";
import { checkSession } from "../services/authService";
import { getActiveInventory } from "../services/inventoryService";


jest.mock("../services/authService");
jest.mock("../services/inventoryService");

/* Mock MUI Menu */
jest.mock("@mui/material/Menu", () => {
  return ({ children }: any) => <div>{children}</div>;
});

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Ensure the existence of navbar", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    await waitFor(() => expect(checkSession).toHaveBeenCalled());
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("Shows login options when user is logged out", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect((await screen.findAllByText(/log in/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sign up/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/forgot password/i).length).toBeGreaterThan(0);
  });

  test("Shows navigation items when user is logged in", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect((await screen.findAllByText("Inventories")).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Items").length).toBeGreaterThan(0);
  });

  test("Shows active inventory name", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect((await screen.findAllByText("Warehouse A")).length).toBeGreaterThan(
      0,
    );
  });

  test("Shows fallback when no inventory is selected", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getActiveInventory as jest.Mock).mockResolvedValue(null);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(
      (await screen.findAllByText(/no inventory selected/i)).length,
    ).toBeGreaterThan(0);
  });

  test("Opens mobile menu when menu button is clicked", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    const menuButton = await screen.findByRole("button");

    fireEvent.click(menuButton);

    expect((await screen.findAllByText(/log in/i)).length).toBeGreaterThan(0);
  });
});
