import { render, screen } from "@testing-library/react";

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
