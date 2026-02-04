import apiClient from "./apiClient";

export type AdjustStockDirection = "increase" | "decrease";

type AdjustStockResponse = {
  stock: number;
  message?: string;
};

/**
 * Adjust stock for an item (increase or decrease).
 * Backend is source of truth for validation.
 */
export async function adjustStock(
  itemId: number | string,
  direction: "increase" | "decrease",
  amount: number,
): Promise<AdjustStockResponse> {
  const response = await apiClient.post(
    `/api/inventory/${itemId}/adjust-stock/`,
    {
      direction,
      amount,
    },
  );

  return response.data;
}
