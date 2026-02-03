import axios from "axios";

type AdjustStockResponse = {
  stock: number;
  message?: string;
};

export const adjustStock = async (
  itemId: number,
  direction: "increase" | "decrease",
  amount: number,
): Promise<AdjustStockResponse> => {
  const response = await axios.post(`/api/inventory/${itemId}/adjust-stock/`, {
    direction,
    amount,
  });

  return response.data;
};
