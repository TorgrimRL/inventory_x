import "@testing-library/jest-dom";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import InventoryMembersPage from "../pages/inventoryMembers";
import {
  getActiveInventory,
  listInventoryMembers,
  removeInventoryMember,
} from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  getActiveInventory: jest.fn(),
  listInventoryMembers: jest.fn(),
  removeInventoryMember: jest.fn(),
}));

jest.mock("../App", () => ({
  PATHS: {
    DASHBOARD: "/dashboard",
    INVITE_EMPLOYEE: "/invite_employee",
    INVENTORY_MEMBERS: "/inventory_members",
  },
}));

jest.mock("../components/inventory/requireActiveInventory", () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: "/inventory_members",
    search: "",
    hash: "",
    state: null,
    key: "test-key",
  }),
}));

const mockedGetActiveInventory = getActiveInventory as jest.MockedFunction<
  typeof getActiveInventory
>;
const mockedListInventoryMembers = listInventoryMembers as jest.MockedFunction<
  typeof listInventoryMembers
>;
const mockedRemoveInventoryMember =
  removeInventoryMember as jest.MockedFunction<typeof removeInventoryMember>;

describe("InventoryMembersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("owner can remove employee and sees success feedback", async () => {
    mockedGetActiveInventory.mockResolvedValue({
      id: "inv-1",
      name: "Ola AS",
      orgNumber: "123456789",
      role: "OWNER",
    });

    mockedListInventoryMembers.mockResolvedValue([
      {
        id: "m-1",
        email: "owner@example.com",
        role: "OWNER",
      },
      {
        id: "m-2",
        email: "alice@example.com",
        role: "EMPLOYEE",
      },
    ] as any);

    mockedRemoveInventoryMember.mockResolvedValue({
      message: "Employee access removed",
    });

    const user = userEvent.setup();

    render(<InventoryMembersPage />);

    expect(await screen.findByText("alice@example.com")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /remove/i,
      }),
    );

    const dialog = await screen.findByRole("dialog");

    await user.click(
      within(dialog).getByRole("button", {
        name: /remove/i,
      }),
    );

    await waitFor(() => {
      expect(mockedRemoveInventoryMember).toHaveBeenCalledWith("m-2");
    });

    await waitFor(() => {
      expect(screen.queryByText("alice@example.com")).not.toBeInTheDocument();
    });

    expect(screen.getByText(/employee access removed/i)).toBeInTheDocument();
  });

  test("non-owner does not see remove action", async () => {
    mockedGetActiveInventory.mockResolvedValue({
      id: "inv-1",
      name: "Ola AS",
      orgNumber: "123456789",
      role: "EMPLOYEE",
    });

    mockedListInventoryMembers.mockResolvedValue([
      {
        id: "m-1",
        email: "owner@example.com",
        role: "OWNER",
      },
      {
        id: "m-2",
        email: "alice@example.com",
        role: "EMPLOYEE",
      },
    ] as any);

    render(<InventoryMembersPage />);

    expect(await screen.findByText("alice@example.com")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /remove access for alice@example.com/i,
      }),
    ).not.toBeInTheDocument();
  });

  test("owner memberships cannot be removed", async () => {
    mockedGetActiveInventory.mockResolvedValue({
      id: "inv-1",
      name: "Ola AS",
      orgNumber: "123456789",
      role: "OWNER",
    });

    mockedListInventoryMembers.mockResolvedValue([
      {
        id: "m-1",
        email: "owner@example.com",
        role: "OWNER",
      },
      {
        id: "m-2",
        email: "other-owner@example.com",
        role: "OWNER",
      },
    ] as any);

    render(<InventoryMembersPage />);

    expect(
      await screen.findByText("other-owner@example.com"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /remove access for other-owner@example.com/i,
      }),
    ).not.toBeInTheDocument();
  });

  test("shows backend error when remove fails", async () => {
    mockedGetActiveInventory.mockResolvedValue({
      id: "inv-1",
      name: "Ola AS",
      orgNumber: "123456789",
      role: "OWNER",
    });

    mockedListInventoryMembers.mockResolvedValue([
      {
        id: "m-1",
        email: "owner@example.com",
        role: "OWNER",
      },
      {
        id: "m-2",
        email: "alice@example.com",
        role: "EMPLOYEE",
      },
    ] as any);

    mockedRemoveInventoryMember.mockRejectedValue({
      response: {
        data: {
          detail: "Only employee memberships can be removed.",
        },
      },
    });

    const user = userEvent.setup();

    render(<InventoryMembersPage />);

    expect(await screen.findByText("alice@example.com")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /remove/i,
      }),
    );

    const dialog = await screen.findByRole("dialog");

    await user.click(
      within(dialog).getByRole("button", {
        name: /remove/i,
      }),
    );

    expect(
      await screen.findByText(/only employee memberships can be removed/i),
    ).toBeInTheDocument();

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });
});
