import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import InventoryKpiSummary from "../components/inventory/InventoryKpiSummary";
import ItemDetailsModal from "../components/inventory/itemDetailsModal.tsx";
import ItemFormModal from "../components/inventory/ItemFormModal";
import ItemSearchBar from "../components/inventory/ItemSearchBar";
import ItemTable from "../components/inventory/ItemTable";
import ManageCategoriesDialog from "../components/inventory/ManageCategoriesDialog";
import ManageCustomFieldsDialog from "../components/inventory/ManageCustomFieldsDialog";
import StockLog from "../components/inventory/StockLog";
import ApiClient from "../services/apiClient.ts";
import {
  getActiveInventory,
  listActiveCategories,
  updateItem,
} from "../services/inventoryService";
import {
  type Category,
  type InventoryCustomField,
  type InventoryItem,
  isLowStock,
} from "../types/itemPageTypes.ts";

export default function ItemPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("Item added");

  const [searchInput, setSearchInput] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [customFields, setCustomFields] = useState<InventoryCustomField[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] =
    useState<InventoryItem | null>(null);

  const [canEditDetails, setCanEditDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [updatingItemId, setUpdatingItemId] = useState<string | number | null>(
    null,
  );

  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThresholdInput, setLowStockThresholdInput] = useState("5");
  const [selectedLogItemId, setSelectedLogItemId] = useState<
    number | string | null
  >(null);

  const [customFieldsDialogOpen, setCustomFieldsDialogOpen] = useState(false);

  const handleOpenStockLog = (id: number | string) => setSelectedLogItemId(id);
  const handleCloseStockLog = () => setSelectedLogItemId(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get("/api/inventory/");
      const data = res.data;
      setItems((data.data || data) as InventoryItem[]);
    } catch (e) {
      console.error(e);
      setError("Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRole() {
    try {
      const active = await getActiveInventory();
      setCanEditDetails(active?.role === "owner");
    } catch {
      setCanEditDetails(false);
    }
  }

  async function loadCustomFields() {
    try {
      const res = await ApiClient.get("/api/inventory/active/fields/");
      const data = res.data;
      setCustomFields((data.data || data || []) as InventoryCustomField[]);
    } catch {
      setCustomFields([]);
      setSnackMessage(
        "Warning: Failed to load custom fields. Some columns might be missing.",
      );
      setSnackOpen(true);
    }
  }

  async function loadCategories() {
    try {
      const allCategories = await listActiveCategories();
      setCategories(allCategories);
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => {
    loadItems();
    loadRole();
    loadCategories();
    loadCustomFields();
  }, []);

  function openAddForm() {
    setError(null);
    setSelectedItem(null);
    setFormMode("add");
    setFormOpen(true);
  }

  function openEditDetails(item: InventoryItem) {
    setError(null);
    setSelectedItem(item);
    setFormMode("edit");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setSelectedItem(null);
  }

  function handleOpenItemDetails(item: InventoryItem) {
    setSelectedDetailsItem(item);
    setDetailsOpen(true);
  }

  function handleCloseItemDetails() {
    setDetailsOpen(false);
    setSelectedDetailsItem(null);
  }

  useEffect(() => {
    if (!selectedDetailsItem) return;

    const latestSelectedItem = items.find(
      (item) => item.id === selectedDetailsItem.id,
    );

    if (latestSelectedItem) {
      setSelectedDetailsItem(latestSelectedItem);
    }
  }, [items, selectedDetailsItem]);

  const lowStockThreshold = Math.max(
    0,
    Number.parseInt(lowStockThresholdInput || "0", 10) || 0,
  );
  const lowStockFilterThreshold = lowStockThreshold;

  const categoryNameById = useMemo(
    () =>
      new Map(
        categories.map(
          (category) => [String(category.id), category.name] as const,
        ),
      ),
    [categories],
  );

  function renderCategoryNames(ids?: string[]) {
    if (!ids || ids.length === 0) return "-";

    const mapped = ids
      .map((id) => categoryNameById.get(String(id)) || null)
      .filter((name): name is string => Boolean(name));

    if (mapped.length > 0) return mapped.join(", ");

    return ids.join(", ");
  }

  const displayedItems = useMemo(() => {
    const q = searchInput.trim().toLowerCase();

    const searched =
      q.length === 0
        ? items
        : items.filter((it) => (it.name ?? "").toLowerCase().includes(q));

    const byCategory =
      selectedCategoryIds.length === 0
        ? searched
        : searched.filter((item) => {
            const ids = (item.category_ids || []).map(String);
            return selectedCategoryIds.every((selectedId) =>
              selectedId === "__no_category__"
                ? ids.length === 0
                : ids.includes(selectedId),
            );
          });

    const filtered = byCategory.filter(
      (item) => !lowStockOnly || item.stock <= lowStockFilterThreshold,
    );

    return [...filtered].sort((a, b) => {
      const getVal = (item: InventoryItem) => {
        if (sortField === "status") return isLowStock(item) ? 0 : 1;
        if (sortField in item) return (item as any)[sortField];

        let cFields = item.custom_fields;
        if (typeof cFields === "string") {
          try {
            cFields = JSON.parse(cFields);
          } catch {
            cFields = {};
          }
        }
        return (cFields as Record<string, any>)?.[sortField];
      };

      let valA = getVal(a);
      let valB = getVal(b);

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      let compare = 0;

      if (valA === "" && valB !== "") compare = 1;
      else if (valA !== "" && valB === "") compare = -1;
      else {
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) compare = numA - numB;
        else compare = String(valA).localeCompare(String(valB));
      }

      return sortDirection === "asc" ? compare : -compare;
    });
  }, [
    items,
    searchInput,
    selectedCategoryIds,
    lowStockOnly,
    lowStockFilterThreshold,
    sortField,
    sortDirection,
  ]);

  const rowsPerPage = 30;
  const pagedItems = displayedItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(displayedItems.length / rowsPerPage) - 1,
    );
    if (page > maxPage) setPage(maxPage);
  }, [displayedItems.length, page]);

  useEffect(() => {
    setPage(0);
  }, [
    searchInput,
    selectedCategoryIds,
    lowStockOnly,
    lowStockThresholdInput,
    sortField,
    sortDirection,
  ]);

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("desc");
  }

  function handleClearSearch() {
    setSearchInput("");
  }

  async function handleInlineCategoryChange(
    item: InventoryItem,
    nextCategoryIds: string[],
  ) {
    setError(null);
    setUpdatingItemId(item.id);
    try {
      await updateItem(item.id, {
        name: item.name,
        price: Number(item.price),
        low_stock_threshold: item.low_stock_threshold ?? null,
        low_stock_notification: item.low_stock_notification,
        category_ids: nextCategoryIds,
      });
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, category_ids: nextCategoryIds } : it,
        ),
      );
      setSnackMessage("Item categories updated");
      setSnackOpen(true);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || "Failed to update item categories.";
      setError(String(detail));
    } finally {
      setUpdatingItemId(null);
    }
  }

  function resetListControls() {
    setSortField("stock");
    setSortDirection("asc");
    setLowStockOnly(false);
    setLowStockThresholdInput("5");
    setSelectedCategoryIds([]);
  }

  const hasCategoryFilter = selectedCategoryIds.length > 0;
  const showFilteredMetrics =
    searchInput.trim().length > 0 || lowStockOnly || hasCategoryFilter;

  const initialCategoryIds = useMemo(
    () => selectedItem?.category_ids?.map(String) || [],
    [selectedItem?.category_ids],
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            {canEditDetails && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<SettingsIcon />}
                onClick={() => setCustomFieldsDialogOpen(true)}
              >
                Manage fields
              </Button>
            )}
            {canEditDetails && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<SettingsIcon />}
                onClick={() => setCategoryDialogOpen(true)}
              >
                Manage categories
              </Button>
            )}
            {canEditDetails && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddForm}
              >
                Add item
              </Button>
            )}
          </Stack>

          <Paper sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ gap: 2 }}
            >
              <Box>
                <Typography variant="h5">Items</Typography>
                <Typography variant="body2" color="text.secondary">
                  {displayedItems.length} of {items.length} item
                  {items.length === 1 ? "" : "s"}
                </Typography>
              </Box>

              <IconButton
                aria-label="Refresh"
                onClick={loadItems}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              Search and filter
            </Typography>

            <Box sx={{ maxWidth: 420 }}>
              <ItemSearchBar
                value={searchInput}
                disabled={loading}
                onChange={setSearchInput}
                onSearch={() => {}}
                onClear={handleClearSearch}
              />
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mb: 4, mt: 1, rowGap: 1 }}
              flexWrap="wrap"
            >
              <TextField
                select
                label="Category"
                size="small"
                value={selectedCategoryIds}
                onChange={(e) => {
                  const value = e.target.value;
                  const nextIds = Array.isArray(value)
                    ? value.map(String)
                    : String(value).split(",");

                  const wasNoCategorySelected =
                    selectedCategoryIds.includes("__no_category__");
                  const isNoCategoryInNext =
                    nextIds.includes("__no_category__");

                  if (!wasNoCategorySelected && isNoCategoryInNext)
                    setSelectedCategoryIds(["__no_category__"]);
                  else if (wasNoCategorySelected && nextIds.length > 1)
                    setSelectedCategoryIds(
                      nextIds.filter((id) => id !== "__no_category__"),
                    );
                  else setSelectedCategoryIds(nextIds);
                }}
                sx={{ minWidth: 260 }}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const ids = selected as string[];
                    if (ids.length === 0) return "All categories";
                    return ids
                      .map((id) => {
                        if (id === "__no_category__")
                          return "No category added";
                        return (
                          categories.find((category) => category.id === id)
                            ?.name || id
                        );
                      })
                      .join(", ");
                  },
                }}
              >
                <MenuItem value="__no_category__">
                  <Checkbox
                    size="small"
                    checked={selectedCategoryIds.includes("__no_category__")}
                  />
                  <ListItemText primary="No category added" />
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox
                      size="small"
                      checked={selectedCategoryIds.includes(category.id)}
                    />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setSelectedCategoryIds([])}
                disabled={!hasCategoryFilter}
              >
                Clear category
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ flexWrap: "wrap" }}
              >
                <TextField
                  size="small"
                  type="number"
                  label="Stock filter (<=)"
                  value={lowStockThresholdInput}
                  onFocus={(e) => {
                    if (e.target.value === "0") setLowStockThresholdInput("");
                  }}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next === "") return setLowStockThresholdInput("");
                    if (!/^\d+$/.test(next)) return;
                    setLowStockThresholdInput(
                      String(Number.parseInt(next, 10)),
                    );
                  }}
                  onBlur={() => {
                    if (lowStockThresholdInput.trim() === "")
                      setLowStockThresholdInput("0");
                  }}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ width: { xs: "100%", sm: 150 } }}
                />
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2">
                      Activate stock filter
                    </Typography>
                    <Switch
                      checked={lowStockOnly}
                      onChange={(e) => setLowStockOnly(e.target.checked)}
                      inputProps={{ "aria-label": "Activate stock filter" }}
                    />
                  </Stack>

                  <Button
                    onClick={resetListControls}
                    variant="outlined"
                    color="inherit"
                    size="small"
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Stack>

            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              Key metrics
            </Typography>

            <InventoryKpiSummary
              allItems={items}
              visibleItems={displayedItems}
              showFilteredMetrics={showFilteredMetrics}
              lowStockFilterThreshold={lowStockFilterThreshold}
            />

            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              List of items
            </Typography>

            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 7 }}>
                <CircularProgress />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Loading items…
                </Typography>
              </Stack>
            ) : displayedItems.length === 0 ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 7 }}>
                <Typography variant="body1">
                  {hasCategoryFilter
                    ? "No items match your search."
                    : "No items found."}
                </Typography>
              </Stack>
            ) : (
              <ItemTable
                pagedItems={pagedItems}
                totalItemsCount={displayedItems.length}
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleOpenStockLog={handleOpenStockLog}
                categories={categories}
                updatingItemId={updatingItemId}
                handleInlineCategoryChange={handleInlineCategoryChange}
                renderCategoryNames={renderCategoryNames}
                openEditDetails={openEditDetails}
                customFields={customFields}
                openItemDetails={handleOpenItemDetails}
              />
            )}
          </Paper>
        </Stack>
      </Container>

      <ManageCategoriesDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        categories={categories}
        setCategories={setCategories}
        setItems={setItems}
        setSnackMessage={setSnackMessage}
        setSnackOpen={setSnackOpen}
      />

      <ItemFormModal
        open={formOpen}
        mode={formMode}
        itemId={selectedItem?.id}
        initialName={selectedItem?.name || ""}
        description={selectedItem?.description || ""}
        initialPrice={selectedItem ? Number(selectedItem.price) : 0}
        currentStock={selectedItem?.stock || 0}
        initialCategoryIds={initialCategoryIds}
        initialImageUrl={selectedItem?.image_url ?? null}
        initialCustomFields={selectedItem?.custom_fields}
        initialLowStockThreshold={selectedItem?.low_stock_threshold ?? null}
        low_stock_notification={selectedItem?.low_stock_notification || false}
        canEditDetails={canEditDetails}
        onClose={closeForm}
        onItemCreated={(created) => {
          setItems((prev) => [
            ...prev,
            { ...created, order_id: Math.random().toString() },
          ]);
          setSnackMessage("Item added");
          setSnackOpen(true);
        }}
        onItemUpdated={async (updated: any) => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === updated.id ? { ...it, ...updated } : it,
            ),
          );
          setSelectedItem((prev) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
          );
          setSelectedDetailsItem((prev) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
          );
          await loadItems();
          setSnackMessage("Item updated");
          setSnackOpen(true);
        }}
        onStockUpdated={(newStock) => {
          if (selectedItem) {
            setItems((prev) =>
              prev.map((it) =>
                it.id === selectedItem.id ? { ...it, stock: newStock } : it,
              ),
            );
            setSnackMessage("Stock updated");
            setSnackOpen(true);
          }
        }}
        onItemDeleted={(id) => {
          setItems((prev) => prev.filter((it) => it.id !== id));
          setSnackMessage("Item deleted");
          setSnackOpen(true);
        }}
      />

      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackMessage.includes("Warning") ? "error" : "success"}
          variant="filled"
        >
          {snackMessage}
        </Alert>
      </Snackbar>
      <ItemDetailsModal
        open={detailsOpen}
        item={
          selectedDetailsItem
            ? {
                name: selectedDetailsItem.name,
                category: renderCategoryNames(
                  (selectedDetailsItem.category_ids || []).map(String),
                ),
                stock: selectedDetailsItem.stock,
                price: Number(selectedDetailsItem.price),
                status:
                  selectedDetailsItem.stock === 0
                    ? "Low stock"
                    : isLowStock(selectedDetailsItem)
                      ? "Low stock"
                      : "In stock",
                lowStockThreshold: selectedDetailsItem.low_stock_threshold,
                description: selectedDetailsItem.description ?? undefined,
                imageUrl: selectedDetailsItem.image_url ?? null,
                custom_fields: selectedDetailsItem.custom_fields,
              }
            : undefined
        }
        customFields={customFields}
        onClose={handleCloseItemDetails}
      />
      <StockLog
        open={Boolean(selectedLogItemId)}
        itemId={selectedLogItemId}
        onClose={handleCloseStockLog}
      />

      <ManageCustomFieldsDialog
        open={customFieldsDialogOpen}
        onClose={() => setCustomFieldsDialogOpen(false)}
        customFields={customFields}
        setCustomFields={setCustomFields}
        setSnackMessage={setSnackMessage}
        setSnackOpen={setSnackOpen}
      />
    </Box>
  );
}
