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

describe("Item image upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/api/inventory/active/") {
        return Promise.resolve({
          data: {
            id: "inv-1",
            name: "Main Inventory",
            orgNumber: "123456789",
            role: "owner",
          },
          status: 200,
        } as any);
      }

      if (url === "/api/inventory/active/categories/") {
        return Promise.resolve({ data: [] } as any);
      }

      return Promise.resolve({
        data: {
          data: [
            {
              id: 1,
              name: "Milk",
              stock: 10,
              price: 20,
              low_stock_threshold: 8,
              low_stock_notification: false,
              image_url: null,
            },
          ],
        },
      } as any);
    });
  });

  test("uploads image successfully, shows thumbnail in item list, and enlarges on click", async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      status: 200,
      data: {
        id: 1,
        name: "Milk",
        price: 20,
        stock: 10,
        low_stock_threshold: 8,
        low_stock_notification: false,
        category_ids: [],
        image_url: "/media/items/milk.png",
      },
    } as any);

    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = await screen.findByRole("dialog");

    const fileInput = within(dialog).getByLabelText(/upload image/i, {
      selector: 'input[type="file"]',
    });
    const file = new File([new Uint8Array([137, 80, 78, 71])], "milk.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalled();
    });

    const thumbnail = await screen.findByAltText(/milk image thumbnail/i);
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute(
      "src",
      expect.stringMatching(/\/media\/items\/milk\.png$/i),
    );

    await user.click(thumbnail);
    expect(
      await screen.findByAltText(/milk image preview/i),
    ).toBeInTheDocument();
  });

  test("shows validation error for invalid file type", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");
    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = await screen.findByRole("dialog");

    const fileInput = within(dialog).getByLabelText(/upload image/i, {
      selector: 'input[type="file"]',
    });
    const file = new File(["gifdata"], "milk.gif", { type: "image/gif" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await within(dialog).findByText(/file type not supported/i),
    ).toBeInTheDocument();
  });

  test("shows validation error for file too large", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await screen.findByText("Milk");
    await user.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = await screen.findByRole("dialog");

    const fileInput = within(dialog).getByLabelText(/upload image/i, {
      selector: 'input[type="file"]',
    });
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 10)], "milk.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await within(dialog).findByText(/file is too large \(max 5 mb\)/i),
    ).toBeInTheDocument();
  });
});
