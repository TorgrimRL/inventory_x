import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

import ItemPage from "../pages/ItemPage";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ItemPage - minimal user story tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("add item and see 'Item added'", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);

    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 1, name: "Keyboard", price: 100, stock: 5 },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText(/no items found/i);

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
});
