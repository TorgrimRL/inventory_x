import apiClient from "./apiClient";

export type AdjustStockDirection = "increase" | "decrease";
export type InventoryMemberRole = "OWNER" | "EMPLOYEE" | "owner" | "employee";

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

export type ActiveInventory = {
  id: string;
  name: string;
  orgNumber: string;
  role: string;
};

export type ItemCategory = {
  id: string;
  name: string;
};

const ACTIVE_ENDPOINT = "/api/inventory/active/";

export async function getActiveInventory(): Promise<ActiveInventory | null> {
  const res = await apiClient.get(ACTIVE_ENDPOINT, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
  });

  if (res.status === 204) return null;
  return res.data as ActiveInventory;
}

export async function setActiveInventory(
  inventoryId: string,
): Promise<ActiveInventory> {
  const res = await apiClient.post(ACTIVE_ENDPOINT, {
    inventory_id: inventoryId,
  });
  return res.data as ActiveInventory;
}

export async function listActiveCategories(): Promise<ItemCategory[]> {
  const res = await apiClient.get("/api/inventory/active/categories/");
  const data: unknown = res.data;

  if (!Array.isArray(data)) return [];

  return data
    .map((raw) => {
      const obj = raw as Record<string, unknown>;
      const id = String(obj.id ?? "");
      const name = String(obj.name ?? "");
      return { id, name };
    })
    .filter((category) => category.id && category.name);
}

export type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
  low_stock_threshold: number | null;
  category_ids?: string[];
  category_names?: string[];
};

export async function listInventoryItems(): Promise<InventoryItem[]> {
  const res = await apiClient.get("/api/inventory/");
  const data = res.data;
  return (data.data || data) as InventoryItem[];
}

export async function updateItem(
  itemId: number | string,
  payload: {
    name: string;
    price: number;
    low_stock_threshold?: null | number;
    category_ids?: string[];
  },
) {
  const res = await apiClient.patch(`/api/inventory/${itemId}/`, payload);
  return res.data;
}

export type InventoryHistoryPoint = {
  month: string;
  value: number;
};

export async function getInventoryHistory(
  year: number,
): Promise<InventoryHistoryPoint[]> {
  const res = await apiClient.get("/api/inventory/active/history/", {
    params: { year },
  });
  return res.data as InventoryHistoryPoint[];
}

export async function createActiveCategory(
  name: string,
): Promise<ItemCategory> {
  const res = await apiClient.post("/api/inventory/active/categories/", {
    name,
  });
  return res.data as ItemCategory;
}

export async function deleteItem(itemId: number | string) {
  const res = await apiClient.delete(`/api/inventory/${itemId}/`);
  return res.data;
}

const INVITE_ENDPOINT = "/api/inventory/inventories/invite/";

/**
 * Invites a user to the currently active inventory via email.
 */
export async function inviteUser(email: string): Promise<void> {
  await apiClient.post(INVITE_ENDPOINT, { email });
}

export type InventoryMember = {
  id: string;
  email: string;
  role: InventoryMemberRole;
};

type RawInventoryMember = {
  id: string;
  role: InventoryMemberRole;
  email?: string;
  user?: {
    email?: string;
  };
};

function normalizeMember(raw: RawInventoryMember): InventoryMember {
  return {
    id: raw.id,
    role: raw.role,
    email: raw.email ?? raw.user?.email ?? "",
  };
}

const MEMBERS_ENDPOINT = "/api/inventory/members/";

export async function listInventoryMembers(): Promise<InventoryMember[]> {
  const res = await apiClient.get(MEMBERS_ENDPOINT);
  const data: unknown = res.data;

  if (Array.isArray(data)) {
    return (data as RawInventoryMember[]).map(normalizeMember);
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.results)) {
      return (obj.results as RawInventoryMember[]).map(normalizeMember);
    }

    if (Array.isArray(obj.members)) {
      return (obj.members as RawInventoryMember[]).map(normalizeMember);
    }

    if (Array.isArray(obj.memberships)) {
      return (obj.memberships as RawInventoryMember[]).map(normalizeMember);
    }
  }

  return [];
}

export async function removeInventoryMember(
  membershipId: string,
): Promise<{ message: string }> {
  const res = await apiClient.delete(`/api/inventory/members/${membershipId}/`);
  return res.data;
}
