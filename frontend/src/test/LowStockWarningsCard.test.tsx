import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LowStockWarningsCard from "../components/inventory/LowStockWarningsCard.tsx";
import ApiClient from "../services/apiClient";

jest.mock("../services/apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedApiClient = ApiClient as jest.Mocked<typeof ApiClient>;

describe("LowStockWarningsCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows items that are at or below their low-stock threshold", async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 1,
            name: "Bread",
            stock: 3,
            low_stock_threshold: 5,
          },
          {
            id: 2,
            name: "Milk",
            stock: 5,
            low_stock_threshold: 5,
          },
        ],
      },
    } as any);

    render(<LowStockWarningsCard />);

    expect(await screen.findByText("Bread")).toBeInTheDocument();
    expect(await screen.findByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Stock: 3 / Threshold: 5")).toBeInTheDocument();
    expect(screen.getByText("Stock: 5 / Threshold: 5")).toBeInTheDocument();
  });

  test("does not show items that are above threshold or have no threshold", async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 1,
            name: "Bread",
            stock: 10,
            low_stock_threshold: 5,
          },
          {
            id: 2,
            name: "Butter",
            stock: 2,
            low_stock_threshold: null,
          },
        ],
      },
    } as any);

    render(<LowStockWarningsCard />);

    expect(
      await screen.findByText(/no low-stock warnings/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bread")).not.toBeInTheDocument();
    expect(screen.queryByText("Butter")).not.toBeInTheDocument();
  });

  test("paginates low-stock warnings after 5 items instead of using a scroll list", async () => {
    const user = userEvent.setup();

    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 1, name: "Item 1", stock: 1, low_stock_threshold: 5 },
          { id: 2, name: "Item 2", stock: 1, low_stock_threshold: 5 },
          { id: 3, name: "Item 3", stock: 1, low_stock_threshold: 5 },
          { id: 4, name: "Item 4", stock: 1, low_stock_threshold: 5 },
          { id: 5, name: "Item 5", stock: 1, low_stock_threshold: 5 },
          { id: 6, name: "Item 6", stock: 1, low_stock_threshold: 5 },
        ],
      },
    } as any);

    render(<LowStockWarningsCard />);

    expect(await screen.findByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next page/i }));

    expect(await screen.findByText("Item 6")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  test("shows empty state when there are no low-stock warnings", async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [],
      },
    } as any);

    render(<LowStockWarningsCard />);

    expect(
      await screen.findByText(/no low-stock warnings/i),
    ).toBeInTheDocument();
  });
});
