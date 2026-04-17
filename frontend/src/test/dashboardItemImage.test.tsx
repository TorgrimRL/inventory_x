import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

import ItemPage from "../pages/ItemPage";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Item image display", () => {
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
              image_url: "/media/items/milk.png",
            },
            {
              id: 2,
              name: "Bread",
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

  test("shows thumbnail in item list and opens larger preview on click", async () => {
    const user = userEvent.setup();
    render(<ItemPage />);

    const milkRow = (await screen.findByText("Milk")).closest("tr");
    expect(milkRow).not.toBeNull();

    const thumbnail = within(milkRow as HTMLElement).getByRole("img", {
      name: "Milk",
    });
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute(
      "src",
      expect.stringMatching(/\/media\/items\/milk\.png$/i),
    );

    await user.click(thumbnail);

    const previewDialog = await screen.findByRole("dialog");
    const previewImage = within(previewDialog).getByRole("img", {
      name: "Milk",
    });
    expect(previewImage).toBeInTheDocument();
  });

  test("shows dash in image column when item has no image", async () => {
    render(<ItemPage />);

    const breadRow = (await screen.findByText("Bread")).closest("tr");
    expect(breadRow).not.toBeNull();

    expect(
      within(breadRow as HTMLElement).getAllByText("-").length,
    ).toBeGreaterThan(0);
  });
});
