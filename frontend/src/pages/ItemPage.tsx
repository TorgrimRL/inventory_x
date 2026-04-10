import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import EditItemModal from "../components/inventory/editItemModal";
import InlineCategorySelect from "../components/inventory/InlineCategorySelect";
import InventoryKpiSummary from "../components/inventory/InventoryKpiSummary";
import ItemSearchBar from "../components/inventory/ItemSearchBar";
import ManageCategoriesDialog from "../components/inventory/ManageCategoriesDialog";
import StockLog from "../components/inventory/StockLog";
import ApiClient from "../services/apiClient.ts";
import {
  createItem,
  getActiveInventory,
  listActiveCategories,
  updateItem,
} from "../services/inventoryService";

type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
  low_stock_threshold: number | null;
  low_stock_notification: boolean;
  category_ids?: string[];
  order_id?: string;
};

type Category = {
  id: string;
  name: string;
};

function extractBackendMessage(err: any): string {
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

function isLowStock(item: InventoryItem) {
  return (
    item.low_stock_threshold != null && item.stock <= item.low_stock_threshold
  );
}

export default function ItemPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [newItemCategoryIds, setNewItemCategoryIds] = useState<string[]>([]);
  const [price, setPrice] = useState<string>("0");
  const priceNumber = Number(price);
  const priceIsInvalid = !Number.isFinite(priceNumber) || priceNumber < 0;

  const [stock, setStock] = useState<string>("0");
  const stockNumber = Number(stock);
  const stockIsInvalid = !Number.isFinite(stockNumber) || stockNumber < 0;

  const [newItemLowStockThreshold, setNewItemLowStockThreshold] =
    useState<string>("");
  const newItemLowStockThresholdNumber =
    newItemLowStockThreshold.trim() === ""
      ? null
      : Number(newItemLowStockThreshold);
  const newItemLowStockThresholdInvalid =
    newItemLowStockThreshold.trim() !== "" &&
    (newItemLowStockThresholdNumber === null ||
      !Number.isInteger(newItemLowStockThresholdNumber) ||
      newItemLowStockThresholdNumber < 0);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("Item added");

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const [canEditDetails, setCanEditDetails] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [updatingItemId, setUpdatingItemId] = useState<string | number | null>(
    null,
  );
  const [sortField, setSortField] = useState<
    "name" | "stock" | "price" | "low_stock_threshold" | "status"
  >("stock");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThresholdInput, setLowStockThresholdInput] = useState("5");
  const [selectedLogItemId, setSelectedLogItemId] = useState<
    number | string | null
  >(null);

  const handleOpenStockLog = (id: number | string) => {
    setSelectedLogItemId(id);
  };

  const handleCloseStockLog = () => {
    setSelectedLogItemId(null);
  };
  const [enableNotification, setEnableNotification] = useState(false);

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
  }, []);

  function openDialog() {
    setError(null);
    setNewItemCategoryIds([]);
    setNewItemLowStockThreshold("");
    setOpen(true);
  }

  function closeDialog() {
    if (!saving) setOpen(false);
  }

  function openEditDetails(item: InventoryItem) {
    setSelectedItem(item);
    setEditOpen(true);
  }

  function closeEditDetails() {
    setEditOpen(false);
    setSelectedItem(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const s = Number(stock);
    if (!Number.isFinite(s) || s < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    if (newItemLowStockThresholdInvalid) {
      setError("Low stock threshold must be a whole number or empty.");
      return;
    }

    setSaving(true);

    const categoryIdsToSave = [...newItemCategoryIds];

    const payload = {
      name: name.trim(),
      price: Number(price),
      stock: s,
      low_stock_threshold: newItemLowStockThresholdNumber,
      low_stock_notification: enableNotification,
      category_ids: categoryIdsToSave,
    };

    try {
      const createdData = await createItem(payload);
      const created = {
        ...createdData,
        category_ids: categoryIdsToSave,
      } as InventoryItem;

      setItems((prev) => [
        ...prev,
        {
          ...created,
          order_id: Math.random().toString(),
        },
      ]);

      setSnackMessage("Item added");
      setSnackOpen(true);

      setOpen(false);
      setName("");
      setNewItemCategoryIds([]);
      setPrice("0");
      setStock("0");
      setNewItemLowStockThreshold("");
      setEnableNotification(false);
    } catch (err) {
      console.error(err);
      setError(extractBackendMessage(err));
    } finally {
      setSaving(false);
    }
  }

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
      let compare = 0;

      if (sortField === "name") compare = a.name.localeCompare(b.name);
      else if (sortField === "stock") compare = a.stock - b.stock;
      else if (sortField === "price")
        compare = Number(a.price) - Number(b.price);
      else if (sortField === "low_stock_threshold") {
        compare =
          (a.low_stock_threshold ?? Number.MAX_SAFE_INTEGER) -
          (b.low_stock_threshold ?? Number.MAX_SAFE_INTEGER);
      } else if (sortField === "status") {
        compare = Number(isLowStock(a)) - Number(isLowStock(b));
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

  function handleSort(
    field: "name" | "stock" | "price" | "low_stock_threshold" | "status",
  ) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
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
                onClick={() => setCategoryDialogOpen(true)}
              >
                Manage categories
              </Button>
            )}
            {canEditDetails && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openDialog}
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
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2, mt: 1 }}
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

                  if (!wasNoCategorySelected && isNoCategoryInNext) {
                    setSelectedCategoryIds(["__no_category__"]);
                  } else if (wasNoCategorySelected && nextIds.length > 1) {
                    setSelectedCategoryIds(
                      nextIds.filter((id) => id !== "__no_category__"),
                    );
                  } else {
                    setSelectedCategoryIds(nextIds);
                  }
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  size="small"
                  type="number"
                  label="Low stock threshold"
                  value={lowStockThresholdInput}
                  onFocus={(e) => {
                    if (e.target.value === "0") setLowStockThresholdInput("");
                  }}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next === "") {
                      setLowStockThresholdInput("");
                      return;
                    }
                    if (!/^\d+$/.test(next)) return;
                    setLowStockThresholdInput(
                      String(Number.parseInt(next, 10)),
                    );
                  }}
                  onBlur={() => {
                    if (lowStockThresholdInput.trim() === "") {
                      setLowStockThresholdInput("0");
                    }
                  }}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ width: 130 }}
                />

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2">Low stock only</Typography>
                  <Switch
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    inputProps={{ "aria-label": "Low stock only" }}
                  />
                </Stack>

                <Button
                  onClick={resetListControls}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  sx={{ alignSelf: "center" }}
                >
                  Reset
                </Button>
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
              <>
                <TableContainer component={Box} sx={{ overflowX: "auto" }}>
                  <Table size="medium" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "46%" }}>
                          <TableSortLabel
                            active={sortField === "name"}
                            hideSortIcon={false}
                            direction={
                              sortField === "name" ? sortDirection : "asc"
                            }
                            onClick={() => handleSort("name")}
                            sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                          >
                            Product name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, width: "12%" }}>
                          Category
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          <TableSortLabel
                            active={sortField === "stock"}
                            hideSortIcon={false}
                            direction={
                              sortField === "stock" ? sortDirection : "asc"
                            }
                            onClick={() => handleSort("stock")}
                            sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                          >
                            Stock
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          <TableSortLabel
                            active={sortField === "price"}
                            hideSortIcon={false}
                            direction={
                              sortField === "price" ? sortDirection : "asc"
                            }
                            onClick={() => handleSort("price")}
                            sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                          >
                            Price
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          <TableSortLabel
                            active={sortField === "status"}
                            hideSortIcon={false}
                            direction={
                              sortField === "status" ? sortDirection : "asc"
                            }
                            onClick={() => handleSort("status")}
                            sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                          >
                            Status
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          <TableSortLabel
                            active={sortField === "low_stock_threshold"}
                            hideSortIcon={false}
                            direction={
                              sortField === "low_stock_threshold"
                                ? sortDirection
                                : "asc"
                            }
                            onClick={() => handleSort("low_stock_threshold")}
                            sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                          >
                            Low Stock Threshold
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {pagedItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell
                            onClick={() => handleOpenStockLog(item.id)}
                            sx={{
                              whiteSpace: "normal",
                              cursor: "pointer",
                              color: "primary.main",
                            }}
                          >
                            {item.name}
                          </TableCell>
                          <TableCell>
                            {/* NOTE: Hardcoded to be disabled, maybe could made into a optional feature a user can enable in future */}
                            {/* eslint-disable-next-line no-constant-condition */}
                            {false ? (
                              <Stack
                                spacing={1}
                                sx={{ minWidth: 160, maxWidth: 190 }}
                              >
                                <InlineCategorySelect
                                  item={item}
                                  categories={categories}
                                  updating={updatingItemId === item.id}
                                  onSave={handleInlineCategoryChange}
                                  renderCategoryNames={renderCategoryNames}
                                />
                              </Stack>
                            ) : (
                              renderCategoryNames(
                                (item.category_ids || []).map(String),
                              )
                            )}
                          </TableCell>
                          <TableCell align="right">{item.stock}</TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat("nb-NO", {
                              style: "currency",
                              currency: "NOK",
                            }).format(Number(item.price))}
                          </TableCell>
                          <TableCell align="right">
                            {isLowStock(item) ? (
                              <Chip
                                label="Low stock"
                                color="warning"
                                size="small"
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {item.low_stock_threshold ?? "—"}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openEditDetails(item)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={displayedItems.length}
                  page={page}
                  onPageChange={(_, nextPage) => setPage(nextPage)}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[30]}
                />
              </>
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

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>Add new item</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                fullWidth
                disabled={saving}
              />

              <TextField
                select
                label="Categories"
                value={newItemCategoryIds}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewItemCategoryIds(
                    Array.isArray(value) ? value : String(value).split(","),
                  );
                }}
                fullWidth
                disabled={saving}
                helperText="Optional: choose one or more existing categories"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const ids = selected as string[];
                    if (ids.length === 0) return "No category added";
                    return ids
                      .map(
                        (id) =>
                          categories.find((category) => category.id === id)
                            ?.name || id,
                      )
                      .join(", ");
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox
                      checked={newItemCategoryIds.includes(category.id)}
                      size="small"
                    />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  inputProps={{ step: "0.01", min: 0 }}
                  required
                  fullWidth
                  disabled={saving}
                  error={priceIsInvalid}
                  helperText={priceIsInvalid ? "Price cannot be negative" : " "}
                />

                <TextField
                  label="Initial stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  type="number"
                  inputProps={{ step: "1", min: 0 }}
                  required
                  fullWidth
                  disabled={saving}
                  error={stockIsInvalid}
                  helperText={stockIsInvalid ? "Stock cannot be negative" : " "}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableNotification}
                    onChange={(e) => setEnableNotification(e.target.checked)}
                    disabled={saving}
                    color="primary"
                  />
                }
                label="Enable low stock notifications for this item"
              />

              <TextField
                label="Low stock threshold"
                value={newItemLowStockThreshold}
                onChange={(e) => setNewItemLowStockThreshold(e.target.value)}
                type="number"
                inputProps={{ step: "1", min: 0 }}
                fullWidth
                disabled={saving}
                error={newItemLowStockThresholdInvalid}
                helperText={
                  newItemLowStockThresholdInvalid
                    ? "Threshold must be a whole number or empty"
                    : "Leave empty for no threshold"
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                saving ||
                stockIsInvalid ||
                priceIsInvalid ||
                newItemLowStockThresholdInvalid ||
                name.trim().length === 0
              }
            >
              {saving ? "Saving…" : "Add item"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {selectedItem && (
        <EditItemModal
          open={editOpen}
          itemId={selectedItem.id}
          initialName={selectedItem.name}
          initialPrice={Number(selectedItem.price)}
          currentStock={selectedItem.stock}
          initialCategoryIds={(selectedItem.category_ids || []).map(String)}
          initialLowStockThreshold={selectedItem.low_stock_threshold ?? null}
          low_stock_notification={selectedItem.low_stock_notification}
          canEditDetails={canEditDetails}
          onClose={closeEditDetails}
          onItemUpdated={(updated: {
            id: number | string;
            name: string;
            price: number;
            lowStockThreshold: number | null;
            low_stock_notification: boolean;
            category_ids?: string[];
          }) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === updated.id
                  ? {
                      ...it,
                      name: updated.name,
                      price: updated.price,
                      low_stock_threshold: updated.lowStockThreshold,
                      low_stock_notification: updated.low_stock_notification,
                      category_ids: updated.category_ids,
                    }
                  : it,
              ),
            );
            setSnackMessage("Item updated");
            setSnackOpen(true);
          }}
          onStockUpdated={(newStock) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === selectedItem.id ? { ...it, stock: newStock } : it,
              ),
            );
            setSnackMessage("Stock updated");
            setSnackOpen(true);
          }}
          onItemDeleted={(id) => {
            setItems((prev) => prev.filter((it) => it.id !== id));
            setSnackMessage("Item deleted");
            setSnackOpen(true);
          }}
        />
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="success"
          variant="filled"
        >
          {snackMessage}
        </Alert>
      </Snackbar>

      <StockLog
        open={Boolean(selectedLogItemId)}
        itemId={selectedLogItemId}
        onClose={handleCloseStockLog}
      />
    </Box>
  );
}
