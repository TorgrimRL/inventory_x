// @ts-expect-error: test polyfill
import { TextDecoder, TextEncoder } from "node:util";

// @ts-expect-error: jsdom polyfill
global.TextEncoder = TextEncoder;

// @ts-expect-error: jsdom polyfill
global.TextDecoder = TextDecoder;

import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Navbar from "../components/navbar/topbar";
import { checkSession, getCurrentUser } from "../services/authService";
import { getActiveInventory } from "../services/inventoryService";
import { LightTheme } from "../theme";

jest.mock("../services/authService");
jest.mock("../services/inventoryService");

/* Mock MUI Menu */
jest.mock("@mui/material/Menu", () => {
  return ({ children, open }: any) => (open ? <div>{children}</div> : null);
});

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderNavbar = (
    mode: "light" | "dark" = "light",
    setMode = jest.fn(),
  ) =>
    render(
      <ThemeProvider theme={LightTheme}>
        <MemoryRouter>
          <Navbar mode={mode} setMode={setMode} />
        </MemoryRouter>
      </ThemeProvider>,
    );

  test("Ensure the existence of navbar", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    renderNavbar();

    await waitFor(() => expect(checkSession).toHaveBeenCalled());
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("Shows login options when user is logged out", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    renderNavbar();

    expect((await screen.findAllByText(/log in/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sign up/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/forgot password/i).length).toBeGreaterThan(0);
  });

  test("Shows navigation items when user is logged in", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: null,
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar();

    expect((await screen.findAllByText("Inventories")).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Items").length).toBeGreaterThan(0);
  });

  test("Shows active inventory name", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: null,
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar();

    expect((await screen.findAllByText("Warehouse A")).length).toBeGreaterThan(
      0,
    );
  });

  test("Shows fallback when no inventory is selected", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: null,
    });
    (getActiveInventory as jest.Mock).mockResolvedValue(null);

    renderNavbar();

    expect(
      (await screen.findAllByText(/no inventory selected/i)).length,
    ).toBeGreaterThan(0);
  });

  test("shows user avatar when user is logged in", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: "https://example.com/avatar.png",
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar();

    const avatar = await screen.findByAltText("Social User");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  test("opens user menu when avatar is clicked", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: "https://example.com/avatar.png",
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar();

    const avatarButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });

    fireEvent.click(avatarButton);

    expect(await screen.findByText(/log out/i)).toBeInTheDocument();
  });

  test("shows log out option in user menu", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: "https://example.com/avatar.png",
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar();

    const avatarButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });

    fireEvent.click(avatarButton);

    expect(await screen.findByText("Log out")).toBeInTheDocument();
  });

  test("Opens mobile menu when menu button is clicked", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    renderNavbar();

    const menuButton = await screen.findByRole("button");
    fireEvent.click(menuButton);
    expect((await screen.findAllByText(/log in/i)).length).toBeGreaterThan(0);
  });

  test("toggles theme when desktop switch is clicked", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    const setMode = jest.fn();
    renderNavbar("light", setMode);

    const switchInput = screen.getByRole("checkbox", { name: /toggle theme/i });
    fireEvent.click(switchInput);
    expect(setMode).toHaveBeenCalled();
  });

  test("toggles theme from mobile menu", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    const setMode = jest.fn();
    renderNavbar("light", setMode);

    const menuButton = await screen.findByRole("button");
    fireEvent.click(menuButton);
    const darkModeOption = await screen.findByText(/dark mode/i);
    fireEvent.click(darkModeOption);
    expect(setMode).toHaveBeenCalled();
  });

  test("switch reflects dark mode state", async () => {
    (checkSession as jest.Mock).mockResolvedValue(false);

    renderNavbar("dark");
    const switchInput = screen.getByRole("checkbox", { name: /toggle theme/i });
    expect(switchInput).toBeChecked();
  });
  test("shows dark mode option in user menu when logged in", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: "https://example.com/avatar.png",
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    renderNavbar("light");

    const avatarButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });

    fireEvent.click(avatarButton);

    expect(await screen.findByText("Dark mode")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  test("toggles theme from switch in user menu", async () => {
    (checkSession as jest.Mock).mockResolvedValue(true);
    (getCurrentUser as jest.Mock).mockResolvedValue({
      username: "Social User",
      email: "social@test.com",
      picture: "https://example.com/avatar.png",
    });
    (getActiveInventory as jest.Mock).mockResolvedValue({
      name: "Warehouse A",
    });

    const setMode = jest.fn();
    renderNavbar("light", setMode);

    const avatarButton = await screen.findByRole("button", {
      name: /open user menu/i,
    });

    fireEvent.click(avatarButton);

    const switchInput = await screen.findByRole("checkbox", {
      name: /toggle theme/i,
    });

    fireEvent.click(switchInput);

    expect(setMode).toHaveBeenCalledTimes(1);
  });
});
