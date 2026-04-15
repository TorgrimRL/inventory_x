import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
      stock: Number(cells[2].textContent?.trim() || "0"),
      price: Number(
        (cells[3].textContent || "0").replace(/[^\d.-]/g, "") || "0",
      ),
      lowStockThreshold: thresholdText === "" ? null : Number(thresholdText),
    };
  });
}

describe("ItemPage", () => {
  jest.setTimeout(30000);
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation((...args: unknown[]) => {
        const first = String(args[0] ?? "");
        const second = String(args[1] ?? "");
        const combined = `${first} ${second}`;
        if (
          combined.includes(
            "MUI: The `anchorEl` prop provided to the component is invalid.",
          )
        ) {
          return;
        }

        console.info(...args);
      });
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/inventory/active/fields/") {
        return Promise.resolve({
          data: {
            data: [
              { id: "cf1", name: "Location", data_type: "text" },
              { id: "cf2", name: "Warranty", data_type: "number" },
            ],
          },
        } as any);
      }

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
                low_stock_threshold: 8,
                custom_fields: JSON.stringify({ cf1: "Aisle 1", cf2: "0" }),
              },
              {
                id: 2,
                name: "Bread",
                stock: 2,
                price: 5,
                category_ids: [],
                low_stock_threshold: 3,
                custom_fields: JSON.stringify({ cf1: "Aisle 2" }),
              },
              {
                id: 3,
                name: "Eggs",
                stock: 7,
                price: 12,
                category_ids: ["c1", "c3"],
                low_stock_threshold: 4,
                custom_fields: "{}",
              },
              {
                id: 4,
                name: "Butter",
                stock: 15,
                price: 15,
                category_ids: ["c3"],
                low_stock_threshold: null,
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
      data: {
        id: 5,
        name: "Keyboard",
        price: 100,
        stock: 5,
        category_ids: [],
        low_stock_threshold: null,
        low_stock_notification: false,
      },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");
    const noCategoryElements = await screen.findAllByText("-");
    expect(noCategoryElements.length).toBeGreaterThan(0);

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
        low_stock_notification: false,
        category_ids: [],
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
        low_stock_notification: false,
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
        low_stock_notification: false,
        category_ids: [],
      });
    });

    expect(await screen.findByText(/item added/i)).toBeInTheDocument();
    expect(await screen.findByText("Keyboard")).toBeInTheDocument();
  });
  test("sorts by stock, name, price,low stock threshold  and status(asc/desc) via table header controls", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    // Default sort: Name desc
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Butter",
      "Bread",
    ]);

    // Name asc
    await user.click(screen.getByRole("button", { name: /product name/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Butter",
      "Eggs",
      "Milk",
    ]);

    // Stock desc
    await user.click(screen.getByRole("button", { name: /^stock$/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Butter",
      "Milk",
      "Eggs",
      "Bread",
    ]);

    // Stock asc
    await user.click(screen.getByRole("button", { name: /^stock$/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
      "Butter",
    ]);

    // Price desc
    await user.click(screen.getByRole("button", { name: /price/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Butter",
      "Eggs",
      "Bread",
    ]);

    // Price asc
    await user.click(screen.getByRole("button", { name: /price/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Butter",
      "Milk",
    ]);

    // Low Stock Threshold desc
    await user.click(
      screen.getByRole("button", { name: /^low stock threshold$/i }),
    );
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Butter", // null -> push to top on desc
      "Milk",
      "Eggs",
      "Bread",
    ]);

    // Low Stock Threshold asc
    await user.click(
      screen.getByRole("button", { name: /^low stock threshold$/i }),
    );
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Eggs",
      "Milk",
      "Butter", // null -> bottom
    ]);

    // Status desc
    await user.click(screen.getByRole("button", { name: /^status$/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Milk",
      "Eggs",
      "Butter",
      "Bread",
    ]);

    // Status asc
    await user.click(screen.getByRole("button", { name: /^status$/i }));
    expect(getVisibleRows().map((r) => r.name)).toEqual([
      "Bread",
      "Milk",
      "Eggs",
      "Butter",
    ]);
  });

  test("edit item supports multiple category selection", async () => {
    mockedAxios.patch.mockResolvedValue({
      status: 200,
      data: {
        id: 1,
        name: "Milk",
        price: 20,
        category_ids: ["c1", "c3"],
        low_stock_threshold: 8,
        low_stock_notification: false,
      },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    const table = screen.getByRole("table");
    const milkCell = within(table).getByText("Milk");
    const milkRow = milkCell.closest("tr") as HTMLElement;
    await user.click(within(milkRow).getByRole("button", { name: /edit/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("combobox", { name: /categories/i }),
    );
    await user.click(await screen.findByRole("option", { name: "Dairy" }));
    await user.keyboard("{Escape}");

    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/inventory/1/", {
        name: "Milk",
        price: 20,
        low_stock_threshold: 8,
        category_ids: ["c1", "c3"],
        low_stock_notification: false,
        custom_fields: { cf1: "Aisle 1", cf2: "0" },
      });
    });
  });

  test("filters items by selected category and supports clearing filter", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    const categorySelect = screen.getByRole("combobox", {
      name: /^category$/i,
    });
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(await screen.findByRole("option", { name: "Cookies" }));
    fireEvent.keyDown(document.activeElement || categorySelect, {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("listbox", { name: /category/i }),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Bread")).not.toBeInTheDocument();
    expect(screen.queryByText("Butter")).not.toBeInTheDocument();

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

  test("multiple selected categories use AND matching", async () => {
    render(<ItemPage />);

    await screen.findByText("Milk");

    const categorySelect = screen.getByRole("combobox", {
      name: /^category$/i,
    });
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(await screen.findByRole("option", { name: "Cookies" }));
    fireEvent.click(await screen.findByRole("option", { name: "Dairy" }));
    fireEvent.keyDown(document.activeElement || categorySelect, {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("listbox", { name: /category/i }),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.queryByText("Butter")).not.toBeInTheDocument();
    expect(screen.queryByText("Bread")).not.toBeInTheDocument();
  });

  test("can filter by 'No category added' from category dropdown", async () => {
    render(<ItemPage />);

    await screen.findByText("Milk");

    const categorySelect = screen.getByRole("combobox", {
      name: /^category$/i,
    });
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(
      await screen.findByRole("option", { name: /no category added/i }),
    );
    fireEvent.keyDown(document.activeElement || categorySelect, {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("listbox", { name: /category/i }),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.queryByText("Eggs")).not.toBeInTheDocument();
    expect(screen.queryByText("Butter")).not.toBeInTheDocument();
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
    await user.type(thresholdInput, "1");
    expect(await screen.findByText(/no items found/i)).toBeInTheDocument();

    // Reset => full list back
    await user.click(screen.getByRole("button", { name: /^reset$/i }));
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Butter")).toBeInTheDocument();
  });
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test("shows low stock status only for items at or below their item threshold", async () => {
    render(<ItemPage />);

    await screen.findByText("Milk");

    const breadRow = screen.getByText("Bread").closest("tr");
    const butterRow = screen.getByText("Butter").closest("tr");

    expect(breadRow).not.toBeNull();
    expect(butterRow).not.toBeNull();

    expect(
      within(breadRow as HTMLElement).getByText("Low stock"),
    ).toBeInTheDocument();

    expect(
      within(butterRow as HTMLElement).queryByText("Low stock"),
    ).not.toBeInTheDocument();
  });

  test("category filter mutual exclusivity for 'No category added'", async () => {
    render(<ItemPage />);
    await screen.findByText("Milk");

    const categorySelect = screen.getByRole("combobox", {
      name: /^category$/i,
    });

    // Open dropdown
    fireEvent.mouseDown(categorySelect);
    // Select 'Cookies'
    fireEvent.click(await screen.findByRole("option", { name: "Cookies" }));
    // Select 'No category added'
    fireEvent.click(
      await screen.findByRole("option", { name: /no category added/i }),
    );

    // Close dropdown
    fireEvent.keyDown(document.activeElement || categorySelect, {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();

    // Now test the reverse
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(await screen.findByRole("option", { name: "Cookies" }));
    fireEvent.keyDown(document.activeElement || categorySelect, {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    // We should now see Milk and not Bread
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.queryByText("Bread")).not.toBeInTheDocument();
  });

  test("Manage categories dialog - add, delete, and nested error handling", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);
    await screen.findByText("Milk");

    // Open the manage categories dialog
    await user.click(
      screen.getByRole("button", { name: /manage categories/i }),
    );
    const dialog = await screen.findByRole("dialog");

    // Verify existing categories loaded
    expect(within(dialog).getByText("Cookies")).toBeInTheDocument();

    // Add a category successfully
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: "c4", name: "Snacks" },
    } as any);

    const newCatInput = within(dialog).getByRole("textbox", {
      name: /new category/i,
    });
    await user.type(newCatInput, "Snacks");
    await user.click(within(dialog).getByRole("button", { name: /^add$/i }));

    expect(await screen.findByText("Category created")).toBeInTheDocument();
    expect(await within(dialog).findByText("Snacks")).toBeInTheDocument();

    // Nested Error Parsing
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          detail: {
            non_field_errors: ["A category with this name already exists."],
          },
        },
      },
    });

    await user.type(newCatInput, "Duplicate");
    await user.click(within(dialog).getByRole("button", { name: /^add$/i }));

    expect(
      await screen.findByText("A category with this name already exists."),
    ).toBeInTheDocument();

    // Delete a category
    mockedAxios.delete.mockResolvedValueOnce({ status: 204 } as any);

    // Find the row containing 'Cookies' and click its specific Delete button
    const cookiesText = within(dialog).getByText("Cookies");
    const cookiesRow = cookiesText.closest(".MuiStack-root") as HTMLElement;
    await user.click(
      within(cookiesRow).getByRole("button", { name: /delete/i }),
    );

    expect(await screen.findByText("Category deleted")).toBeInTheDocument();
    expect(within(dialog).queryByText("Cookies")).not.toBeInTheDocument();
  });

  test("renders custom field columns and supports sorting", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    // Check if custom field headers are rendered
    expect(
      screen.getByRole("button", { name: /location/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /warranty/i }),
    ).toBeInTheDocument();

    // Check if custom field data is rendered in the table for Milk
    expect(screen.getByText("Aisle 1")).toBeInTheDocument();

    // Test sorting by a custom field (Location)
    await user.click(screen.getByRole("button", { name: /location/i }));

    // Check order
    let rows = getVisibleRows().map((r) => r.name);
    // Since Bread is Aisle 2 and Milk is Aisle 1:
    expect(rows.indexOf("Bread")).toBeLessThan(rows.indexOf("Milk"));

    // Click again for Descending
    await user.click(screen.getByRole("button", { name: /location/i }));
    rows = getVisibleRows().map((r) => r.name);
    expect(rows.indexOf("Milk")).toBeLessThan(rows.indexOf("Bread"));
  });

  test("Manage custom fields dialog - add, delete, and type selection", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);
    await screen.findByText("Milk");

    // Open manage fields dialog
    await user.click(screen.getByRole("button", { name: /manage fields/i }));
    const dialog = await screen.findByRole("dialog", {
      name: /manage custom fields/i,
    });

    // Verify existing fields are loaded
    expect(within(dialog).getByText(/Location/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Warranty/i)).toBeInTheDocument();

    // Mock the create field response
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: "cf3", name: "Color", data_type: "text" },
    } as any);

    // Add a new field
    const nameInput = within(dialog).getByRole("textbox", {
      name: /new field name/i,
    });
    await user.type(nameInput, "Color");

    // Select type
    const typeSelect = within(dialog).getByRole("combobox", { name: /type/i });
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(await screen.findByRole("option", { name: /text/i }));

    await user.click(within(dialog).getByRole("button", { name: /^add$/i }));

    expect(await screen.findByText("Custom field created")).toBeInTheDocument();
    expect(await within(dialog).findByText(/Color/i)).toBeInTheDocument();

    // Delete a field
    mockedAxios.delete.mockResolvedValueOnce({ status: 204 } as any);

    // Find the row containing 'Warranty' and click its Delete button
    const warrantyText = within(dialog).getByText(/Warranty/i);
    const warrantyRow = warrantyText.closest(".MuiStack-root") as HTMLElement;
    await user.click(
      within(warrantyRow).getByRole("button", { name: /delete/i }),
    );

    expect(await screen.findByText("Custom field deleted")).toBeInTheDocument();
    expect(within(dialog).queryByText(/Warranty/i)).not.toBeInTheDocument();
  });

  test("employees cannot see the 'Manage fields' button", async () => {
    // Mock the active inventory check to return role: 'employee'
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/inventory/active/") {
        return Promise.resolve({
          data: {
            id: "inv1",
            name: "Test",
            orgNumber: "123",
            role: "employee",
          },
        } as any);
      }
      return Promise.resolve({ data: { data: [] } } as any);
    });

    render(<ItemPage />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Manage fields button should be hidden for employees
    expect(
      screen.queryByRole("button", { name: /manage fields/i }),
    ).not.toBeInTheDocument();
  });
});
