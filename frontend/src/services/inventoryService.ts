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

export type Inventory = {
    id: string;
    name: string;
    orgNumber: string;
    role?: string;
};

type RawInventory = {
    id: string;
    name: string;
    orgNumber?: string;
    org_number?: string;
    role?: string;
};

const INVENTORIES_ENDPOINT = "/api/inventory/inventories/";

function normalize(raw: RawInventory): Inventory {
    return {
        id: raw.id,
        name: raw.name,
        orgNumber: raw.orgNumber ?? raw.org_number ?? "",
        role: raw.role,
    };
}

export async function listInventories(): Promise<Inventory[]> {
    const res = await apiClient.get(INVENTORIES_ENDPOINT);
    const data: unknown = res.data;

    if (Array.isArray(data)) return (data as RawInventory[]).map(normalize);

    if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;

        if (Array.isArray(obj.results))
            return (obj.results as RawInventory[]).map(normalize);

        if (Array.isArray(obj.inventories))
            return (obj.inventories as RawInventory[]).map(normalize);
    }

    return [];
}