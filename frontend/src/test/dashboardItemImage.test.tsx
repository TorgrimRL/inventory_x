import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

import ItemPage from "../pages/ItemPage";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Item image details display", () => {
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
              description: "Fresh milk from Norway",
              stock: 10,
              price: 20,
              low_stock_threshold: 8,
              low_stock_notification: false,
              image_url: "/media/items/milk.png",
            },
            {
              id: 2,
              name: "Bread",
              description: "Baked this morning",
              stock: 4,
              price: 10,
              low_stock_threshold: 2,
              low_stock_notification: false,
              image_url: null,
            },
          ],
        },
      } as any);
    });
  });

  test("does not show image in item list", async () => {
    render(<ItemPage />);

    const milkRow = (await screen.findByText("Milk")).closest("tr");
    expect(milkRow).not.toBeNull();
    expect(
      within(milkRow as HTMLElement).queryByRole("img", { name: "Milk" }),
    ).not.toBeInTheDocument();
  });

  test("shows image in item details and opens larger preview on click", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    await user.click(await screen.findByRole("button", { name: "Milk" }));

    const dialogs = await screen.findAllByRole("dialog");
    const detailsDialog = dialogs[dialogs.length - 1];

    const detailsImage = within(detailsDialog).getByRole("img", {
      name: "Milk",
    });
    expect(detailsImage).toBeInTheDocument();
    expect(detailsImage).toHaveAttribute(
      "src",
      expect.stringMatching(/\/media\/items\/milk\.png$/i),
    );

    await user.click(detailsImage);

    const allDialogs = await screen.findAllByRole("dialog");
    const previewDialog = allDialogs[allDialogs.length - 1];
    const previewImage = within(previewDialog).getByRole("img", {
      name: "Milk",
    });
    expect(previewImage).toBeInTheDocument();
  });
});
