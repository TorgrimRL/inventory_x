// @ts-expect-error: test env shim
import { TextDecoder, TextEncoder } from "util";
// @ts-expect-error: test env shim
global.TextEncoder = TextEncoder;
// @ts-expect-error: test env shim
global.TextDecoder = TextDecoder;

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Dashboard from "../pages/dashboard";
import {
  getActiveInventory,
  getInventoryHistory,
  listActiveCategories,
  listInventoryItems,
} from "../services/inventoryService";

jest.mock("../services/inventoryService", () => ({
  getActiveInventory: jest.fn(),
  getInventoryHistory: jest.fn(),
  listActiveCategories: jest.fn(),
  listInventoryItems: jest.fn(),
}));

jest.mock("../components/inventory/LowStockWarningsCard.tsx", () => () => (
  <div data-testid="low-stock-warnings-card" />
));

const mockedGetActiveInventory = getActiveInventory as jest.MockedFunction<
  typeof getActiveInventory
>;
const mockedGetInventoryHistory = getInventoryHistory as jest.MockedFunction<
  typeof getInventoryHistory
>;
const mockedListActiveCategories = listActiveCategories as jest.MockedFunction<
  typeof listActiveCategories
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
    mockedListActiveCategories.mockResolvedValue([
      { id: "c1", name: "Cookies" },
      { id: "c2", name: "Cakes" },
      { id: "c3", name: "Dairy" },
    ]);
    mockedGetInventoryHistory.mockResolvedValue([
      { month: "Jan", value: 450000 },
      { month: "Feb", value: 400000 },
      { month: "Mar", value: 600000 },
      { month: "Apr", value: 550000 },
      { month: "May", value: 500000 },
      { month: "Jun", value: 750000 },
      { month: "Jul", value: 700000 },
      { month: "Aug", value: 650000 },
      { month: "Sep", value: 900000 },
      { month: "Oct", value: 800000 },
      { month: "Nov", value: 700000 },
      { month: "Dec", value: 450000 },
    ]);
  });

  test("shows a low-stock summary for the active inventory", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
        category_ids: ["c2"],
      },
      {
        id: 3,
        name: "Eggs",
        stock: 4,
        price: 20,
        low_stock_threshold: 4,
        category_ids: ["c1", "c3"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/low stock items/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "2" }),
    ).toBeInTheDocument();
  });

  test("shows a total inventory value summary for the active inventory", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
        category_ids: ["c2"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/total inventory value/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/560\s*kr/i)).toBeInTheDocument();
  });

  test("shows a pie chart for inventory composition by category with names and percentages", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
        category_ids: ["c2"],
      },
      {
        id: 3,
        name: "Eggs",
        stock: 4,
        price: 20,
        low_stock_threshold: 4,
        category_ids: ["c1"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/inventory composition by category/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/cookies/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/cakes/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/67%/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/33%/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByTestId("category-composition-chart"),
    ).toBeInTheDocument();
  });

  test("shows the expanded summary metrics for the selected inventory", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: null,
        category_ids: [],
      },
      {
        id: 3,
        name: "Eggs",
        stock: 4,
        price: 20,
        low_stock_threshold: 4,
        category_ids: ["c1"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/total units in stock/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "16" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/items without category/i)).toBeInTheDocument();
    expect(screen.getByText(/items without threshold/i)).toBeInTheDocument();
  });

  test("shows top inventory value items, lowest stock items, and category value distribution", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
        category_ids: ["c2"],
      },
      {
        id: 3,
        name: "Eggs",
        stock: 1,
        price: 20,
        low_stock_threshold: 4,
        category_ids: ["c1"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/top inventory value items/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/lowest stock items/i)).toBeInTheDocument();
    expect(
      screen.getByText(/category value distribution/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/butter/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/cookies/i).length).toBeGreaterThanOrEqual(1);
  });

  test("shows a line chart for monthly inventory value using mock data and a year selector", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
      {
        id: 2,
        name: "Butter",
        stock: 10,
        price: 50,
        low_stock_threshold: 4,
        category_ids: ["c2"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/inventory value over time/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /year/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026")).toBeInTheDocument();
    expect(screen.getByText(/jan/i)).toBeInTheDocument();
    expect(screen.getByText(/jun/i)).toBeInTheDocument();
    expect(screen.getByText(/dec/i)).toBeInTheDocument();
    const chartContainer = screen.getByTestId("inventory-value-line-chart");
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer.querySelectorAll("circle").length).toBe(12);
    expect(mockedGetInventoryHistory).toHaveBeenCalledWith(2026);
  });

  test("requests inventory history for the default selected year", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockedGetInventoryHistory).toHaveBeenCalledWith(2026);
    });
  });

  test("shows exact monthly value on chart point hover", async () => {
    mockedListInventoryItems.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock: 2,
        price: 30,
        low_stock_threshold: 3,
        category_ids: ["c1"],
      },
    ] as any);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const chart = await screen.findByLabelText(/inventory value line chart/i);
    const points = chart.querySelectorAll("circle");
    expect(points.length).toBeGreaterThan(0);

    fireEvent.mouseEnter(points[0]!);

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Jan:")),
      ).toBeInTheDocument();
    });
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
    expect(screen.getByText(/low stock items/i)).toBeInTheDocument();
    expect(screen.getByText(/total inventory value/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/inventory composition by category/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/inventory value over time/i),
    ).not.toBeInTheDocument();
  });
});
