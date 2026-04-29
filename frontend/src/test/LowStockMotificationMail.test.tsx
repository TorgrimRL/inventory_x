import apiClient from "../services/apiClient";
import { createItem, updateItem } from "../services/inventoryService";

jest.mock("../services/apiClient");

function expectFormDataField(formData: FormData, key: string, value: string) {
  expect(formData).toBeInstanceOf(FormData);
  expect(formData.get(key)).toBe(value);
}

describe("Inventory Service API Wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createItem sends low_stock_notification parameter to server", async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });

    const payload = {
      name: "Test Item",
      price: 100,
      stock: 50,
      low_stock_threshold: 10,
      low_stock_notification: true,
    };

    await createItem(payload as any);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/inventory/",
      expect.any(FormData),
    );

    const formData = (apiClient.post as jest.Mock).mock.calls[0][1] as FormData;
    expectFormDataField(formData, "low_stock_notification", "true");
    expectFormDataField(formData, "stock", "50");
  });

  test("updateItem sends low_stock_notification parameter to server", async () => {
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: { id: 1 } });

    const itemId = 123;
    const updatePayload = {
      name: "Test",
      price: 10,
      low_stock_threshold: null,
      low_stock_notification: false,
    };

    await updateItem(itemId, updatePayload as any);

    expect(apiClient.patch).toHaveBeenCalledWith(
      `/api/inventory/${itemId}/`,
      expect.any(FormData),
    );

    const formData = (apiClient.patch as jest.Mock).mock
      .calls[0][1] as FormData;
    expectFormDataField(formData, "low_stock_notification", "false");
    expect(formData.get("low_stock_threshold")).toBe("");
  });
});
