export type DataTypeEnum = "text" | "number";

export type InventoryCustomField = {
  id: string;
  name: string;
  data_type: DataTypeEnum;
  created_at: string;
};

export type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
  low_stock_threshold: number | null;
  low_stock_notification: boolean;
  category_ids?: string[];
  order_id?: string;
  custom_fields?: string | Record<string, any>;
};

export type Category = {
  id: string;
  name: string;
};

export function extractBackendMessage(err: any): string {
  const data = err?.response?.data;

  if (!data) return "Failed to add item.";
  if (typeof data === "string") return data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (typeof data === "object") {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) parts.push(`${key}: ${value.join(" ")}`);
      else if (typeof value === "string") parts.push(`${key}: ${value}`);
      else if (value && typeof value === "object") {
        parts.push(`${key}: ${JSON.stringify(value)}`);
      }
    }

    if (parts.length > 0) return parts.join(" | ");
  }

  return "Failed to add item.";
}

export function isLowStock(item: InventoryItem) {
  return (
    item.low_stock_threshold != null && item.stock <= item.low_stock_threshold
  );
}
