import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

import ItemPage from "../pages/ItemPage";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

type RowItem = {
  name: string;
  stock: number;
  price: number;
  lowStockThreshold: number | null;
};

function getVisibleRows(): RowItem[] {
  const table = screen.getByRole("table");
  const bodyRows = within(table).getAllByRole("row").slice(1);

  return bodyRows.map((row) => {
    const cells = within(row).getAllByRole("cell");
    const thresholdText = cells[3].textContent?.trim() ?? "";

    return {
      name: cells[0].textContent?.trim() || "",
      stock: Number(cells[1].textContent?.trim() || "0"),
      price: Number(
        (cells[2].textContent || "0").replace(/[^\d.-]/g, "") || "0",
      ),
      lowStockThreshold: thresholdText === "" ? null : Number(thresholdText),
    };
  });
}

describe("ItemPage", () => {
  jest.setTimeout(15000);
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: "Milk", stock: 10, price: 20, low_stock_threshold: 8 },
          { id: 2, name: "Bread", stock: 3, price: 5, low_stock_threshold: 1 },
          { id: 3, name: "Eggs", stock: 7, price: 12, low_stock_threshold: 4 },
          {
            id: 4,
            name: "Butter",
            stock: 15,
            price: 15,
            low_stock_threshold: null,
          },
        ],
      },
    } as any);
  });

  test("add item and see 'Item added'", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: {
        id: 5,
        name: "Keyboard",
        price: 100,
        stock: 5,
        low_stock_threshold: null,
      },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    await user.click(screen.getByRole("button", { name: /add item/i }));

    const dialog = await screen.findByRole("dialog");

    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /price/i,
    });
    const stockInput = within(dialog).getByRole("spinbutton", {
      name: /initial stock/i,
    });

    await user.type(nameInput, "Keyboard");
    await user.clear(priceInput);
    await user.type(priceInput, "100");
    await user.clear(stockInput);
    await user.type(stockInput, "5");

    await user.click(
      within(dialog).getByRole("button", { name: /^add item$/i }),
    );

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/inventory/", {
        name: "Keyboard",
        price: 100,
        stock: 5,
        low_stock_threshold: null,
      });
    });

    expect(await screen.findByText(/item added/i)).toBeInTheDocument();
    expect(await screen.findByText("Keyboard")).toBeInTheDocument();
  });
  test("add item with low stock threshold", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: {
        id: 6,
        name: "Keyboard",
        price: 100,
        stock: 5,
        low_stock_threshold: 4,
      },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    await user.click(screen.getByRole("button", { name: /add item/i }));

    const dialog = await screen.findByRole("dialog");

    const nameInput = within(dialog).getByRole("textbox", { name: /name/i });
    const priceInput = within(dialog).getByRole("spinbutton", {
      name: /^price$/i,
    });
    const stockInput = within(dialog).getByRole("spinbutton", {
      name: /initial stock/i,
    });
    const thresholdInput = within(dialog).getByRole("spinbutton", {
      name: /^low stock threshold$/i,
    });

    await user.type(nameInput, "Keyboard");
    await user.clear(priceInput);
    await user.type(priceInput, "100");
    await user.clear(stockInput);
    await user.type(stockInput, "5");
    await user.type(thresholdInput, "4");

    await user.click(
      within(dialog).getByRole("button", { name: /^add item$/i }),
    );

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/inventory/", {
        name: "Keyboard",
        price: 100,
        stock: 5,
        low_stock_threshold: 4,
      });
    });

    expect(await screen.findByText(/item added/i)).toBeInTheDocument();
    expect(await screen.findByText("Keyboard")).toBeInTheDocument();
  });
  test("sorts by stock, name, price and low stock threshold (asc/desc) via table header controls", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    // Default sort is stock asc
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
      "Butter",
    ]);

    // Stock desc
    await user.click(screen.getByRole("button", { name: /^stock$/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Butter",
      "Milk",
      "Eggs",
      "Bread",
    ]);

    // Name asc, then desc
    await user.click(screen.getByRole("button", { name: /product name/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Butter",
      "Eggs",
      "Milk",
    ]);
    await user.click(screen.getByRole("button", { name: /product name/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Butter",
      "Bread",
    ]);

    // Price asc, then desc
    await user.click(screen.getByRole("button", { name: /price/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Butter",
      "Milk",
    ]);
    await user.click(screen.getByRole("button", { name: /price/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Butter",
      "Eggs",
      "Bread",
    ]);
    // Low Stock Threshold asc, then desc
    await user.click(
      screen.getByRole("button", { name: /^low stock threshold$/i }),
    );
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
      "Butter",
    ]);
    await user.click(
      screen.getByRole("button", { name: /^low stock threshold$/i }),
    );
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Bread",
      "Butter",
    ]);
  });

  test("filters low stock by threshold, shows empty state, and reset restores full list", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    const thresholdInput = screen.getByRole("spinbutton", {
      name: /low stock threshold/i,
    });

    // Default threshold=5 and low-stock-only ON => only Bread (3)
    await user.click(screen.getByRole("switch"));
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.queryByText("Eggs")).not.toBeInTheDocument();
    expect(screen.queryByText("Butter")).not.toBeInTheDocument();

    // Raise threshold to 7 => Bread + Eggs
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "7");
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.queryByText("Butter")).not.toBeInTheDocument();

    // Lower threshold to 2 => empty state
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "2");
    expect(await screen.findByText(/no items found/i)).toBeInTheDocument();

    // Reset => full list back
    await user.click(screen.getByRole("button", { name: /^reset$/i }));
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Butter")).toBeInTheDocument();
  });
});
