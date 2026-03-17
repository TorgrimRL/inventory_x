import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

import ItemPage from "../pages/ItemPage";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

type RowItem = { name: string; stock: number; price: number };

function getVisibleRows(): RowItem[] {
  const table = screen.getByRole("table");
  const bodyRows = within(table).getAllByRole("row").slice(1);

  return bodyRows.map((row) => {
    const cells = within(row).getAllByRole("cell");

    return {
      name: cells[0].textContent?.trim() || "",
      stock: Number(cells[2].textContent?.trim() || "0"),
      price: Number(
        (cells[3].textContent || "0").replace(/[^\d.-]/g, "") || "0",
      ),
    };
  });
}

describe("ItemPage", () => {
  jest.setTimeout(15000);
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/inventory/") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                name: "Milk",
                stock: 10,
                price: 20,
                category_ids: ["c1"],
              },
              {
                id: 2,
                name: "Bread",
                stock: 3,
                price: 5,
                category_ids: [],
              },
              {
                id: 3,
                name: "Eggs",
                stock: 7,
                price: 12,
                category_ids: ["c1", "c3"],
              },
            ],
          },
        } as any);
      }

      if (url === "/api/inventory/active/categories/") {
        return Promise.resolve({
          data: [
            { id: "c1", name: "Cookies" },
            { id: "c2", name: "Cakes" },
            { id: "c3", name: "Dairy" },
          ],
        } as any);
      }

      if (url === "/api/inventory/active/") {
        return Promise.resolve({
          data: { id: "inv1", name: "Test", orgNumber: "123", role: "owner" },
        } as any);
      }

      return Promise.resolve({ data: {} } as any);
    });
  });

  test("add item and see 'Item added'", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 4, name: "Keyboard", price: 100, stock: 5 },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");
    expect(screen.getByText("-")).toBeInTheDocument();

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
      });
    });

    expect(await screen.findByText(/item added/i)).toBeInTheDocument();
    expect(await screen.findByText("Keyboard")).toBeInTheDocument();
  });

  test("sorts by stock, name and price (asc/desc) via table header controls", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    // Default sort is stock asc
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
    ]);

    // Stock desc
    await user.click(screen.getByRole("button", { name: /stock/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Bread",
    ]);

    // Name asc, then desc
    await user.click(screen.getByRole("button", { name: /product name/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
    ]);
    await user.click(screen.getByRole("button", { name: /product name/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Bread",
    ]);

    // Price asc, then desc
    await user.click(screen.getByRole("button", { name: /price/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
    ]);
    await user.click(screen.getByRole("button", { name: /price/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Bread",
    ]);
  });

  test("filters items by selected category and supports clearing filter", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    await user.click(screen.getByRole("combobox", { name: /category/i }));
    await user.click(await screen.findByRole("option", { name: "Cookies" }));

    // Cookies should include Milk and Eggs, but not Bread (no category)
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Bread")).not.toBeInTheDocument();

    // Category filter active + name search miss => category-specific empty state
    await user.type(
      screen.getByRole("textbox", { name: /search by name/i }),
      "zzz",
    );
    expect(
      await screen.findByText(/no items match your search/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear category/i }));
    await user.click(screen.getByRole("button", { name: /^clear$/i }));

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  test("can filter by 'No category added' from category dropdown", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    await user.click(screen.getByRole("combobox", { name: /category/i }));
    await user.click(
      await screen.findByRole("option", { name: /no category added/i }),
    );

    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.queryByText("Eggs")).not.toBeInTheDocument();
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

    // Raise threshold to 7 => Bread + Eggs
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "7");
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();

    // Lower threshold to 2 => empty state
    await user.clear(thresholdInput);
    await user.type(thresholdInput, "2");
    expect(await screen.findByText(/no items found/i)).toBeInTheDocument();

    // Reset => full list back
    await user.click(screen.getByRole("button", { name: /^reset$/i }));
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });
});
