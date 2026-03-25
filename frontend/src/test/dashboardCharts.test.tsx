import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Dashboard from "../pages/dashboard";
import { getActiveInventory, listInventoryItems } from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  getActiveInventory: jest.fn(),
  listInventoryItems: jest.fn(),
}));

jest.mock("../components/inventory/LowStockWarningsCard.tsx", () => () => (
  <div data-testid="low-stock-warnings-card" />
));

const mockedGetActiveInventory = getActiveInventory as jest.MockedFunction<
  typeof getActiveInventory
>;
const mockedListInventoryItems = listInventoryItems as jest.MockedFunction<
  typeof listInventoryItems
>;

describe("Dashboard charts", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetActiveInventory.mockResolvedValue({
      id: "inv1",
      name: "Jessica Cookies AS",
      orgNumber: "123",
      role: "owner",
    });
  });

  test("shows a low-stock summary for the active inventory", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
      },
      {
        id: 3,
        name: "Eggs",
        stock: 4,
        price: 20,
        low_stock_threshold: 4,
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/low stock items/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("shows a total inventory value summary for the active inventory", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/total inventory value/i)).toBeInTheDocument();
    expect(screen.getByText(/560\s*kr/i)).toBeInTheDocument();
  });

  test("shows an empty state when there is not enough data to show charts", async () => {
    mockedListInventoryItems.mockResolvedValue([] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/not enough data to show charts\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/low stock items/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/total inventory value/i)).not.toBeInTheDocument();
  });
});
