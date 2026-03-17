import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import EditItemModal from "../components/inventory/editItemModal";
import InventoryKpiSummary from "../components/inventory/InventoryKpiSummary";
import ItemSearchBar from "../components/inventory/ItemSearchBar";
import ApiClient from "../services/apiClient.ts";
import {
  getActiveInventory,
  listActiveCategories,
} from "../services/inventoryService";

type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
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
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(" ")}`);
      } else if (typeof value === "string") {
        parts.push(`${key}: ${value}`);
      } else if (value && typeof value === "object") {
        parts.push(`${key}: ${JSON.stringify(value)}`);
      }
    }

    if (parts.length > 0) return parts.join(" | ");
  }

  return "Failed to add item.";
}

export default function ItemPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("0");
  const priceNumber = Number(price);
  const priceIsInvalid = !Number.isFinite(priceNumber) || priceNumber < 0;

  const [stock, setStock] = useState<string>("0");
  const stockNumber = Number(stock);
  const stockIsInvalid = !Number.isFinite(stockNumber) || stockNumber < 0;

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("Item added");

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Existing main-branch search
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [canEditDetails, setCanEditDetails] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Story #49 sort + low-stock filter controls
  const [sortField, setSortField] = useState<"name" | "stock" | "price">(
    "stock",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThresholdInput, setLowStockThresholdInput] = useState("5");

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const s = Number(stock);
    if (!Number.isFinite(s) || s < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      price: Number(price),
      stock: s,
    };

    try {
      const res = await ApiClient.post("/api/inventory/", payload);
      const created = res.data as InventoryItem;

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
      setPrice("0");
      setStock("0");
    } catch (err) {
      console.error(err);
      setError(extractBackendMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const showClientHint =
    !saving &&
    (name.trim().length === 0 ||
      !Number.isFinite(Number(price)) ||
      !Number.isFinite(Number(stock)));

  const lowStockThreshold = Math.max(
    0,
    Number.parseInt(lowStockThresholdInput || "0", 10) || 0,
  );

  const categoryNameById = useMemo(
    () =>
      new Map(
        categories.map((category) => [category.id, category.name] as const),
      ),
    [categories],
  );

  const displayedItems = useMemo(() => {
    const q = searchInput.trim().toLowerCase();

    const searched =
      q.length === 0
        ? items
        : items.filter((it) => (it.name ?? "").toLowerCase().includes(q));

    const byCategory =
      selectedCategoryId.length === 0
        ? searched
        : searched.filter((item) => {
            const primaryCategoryId = String(
              (item.category_ids || [])[0] || "",
            );

            if (selectedCategoryId === "__no_category__") {
              return primaryCategoryId.length === 0;
            }

            return primaryCategoryId === selectedCategoryId;
          });

    const filtered = byCategory.filter(
      (item) => !lowStockOnly || item.stock <= lowStockThreshold,
    );

    return [...filtered].sort((a, b) => {
      let compare = 0;

      if (sortField === "name") {
        compare = a.name.localeCompare(b.name);
      } else if (sortField === "stock") {
        compare = a.stock - b.stock;
      } else {
        compare = Number(a.price) - Number(b.price);
      }

      return sortDirection === "asc" ? compare : -compare;
    });
  }, [
    items,
    lowStockOnly,
    lowStockThreshold,
    searchInput,
    selectedCategoryId,
    sortDirection,
    sortField,
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
    selectedCategoryId,
    lowStockOnly,
    lowStockThresholdInput,
    sortField,
    sortDirection,
  ]);

  function handleSort(field: "name" | "stock" | "price") {
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

  function resetListControls() {
    setSortField("stock");
    setSortDirection("asc");
    setLowStockOnly(false);
    setLowStockThresholdInput("5");
    setSelectedCategoryId("");
  }

  const hasCategoryFilter = selectedCategoryId.length > 0;
  const showFilteredMetrics =
    searchInput.trim().length > 0 || lowStockOnly || hasCategoryFilter;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Paper sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ gap: 2 }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  List of items
                </Typography>
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
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                sx={{ minWidth: 260 }}
              >
                <MenuItem value="">All categories</MenuItem>
                <MenuItem value="__no_category__">No category added</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedCategoryId("")}
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
                  size="small"
                  sx={{ alignSelf: "center" }}
                >
                  Reset
                </Button>
              </Stack>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openDialog}
              >
                Add item
              </Button>
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
              lowStockThreshold={lowStockThreshold}
            />

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
                  <Table size="medium" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
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
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
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
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {pagedItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            {(item.category_ids || []).length > 0
                              ? categoryNameById.get(
                                  String((item.category_ids || [])[0]),
                                ) || "-"
                              : "-"}
                          </TableCell>
                          <TableCell align="right">{item.stock}</TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat("nb-NO", {
                              style: "currency",
                              currency: "NOK",
                            }).format(Number(item.price))}
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

              {showClientHint && (
                <Alert severity="info">
                  Name must be set. Price/stock must be positive.
                </Alert>
              )}
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
          canEditDetails={canEditDetails}
          onClose={closeEditDetails}
          onItemUpdated={(updated: {
            id: number | string;
            name: string;
            price: number;
          }) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === updated.id
                  ? { ...it, name: updated.name, price: updated.price }
                  : it,
              ),
            );

            setSnackMessage("Item updated");
            setSnackOpen(true);
          }}
          onStockUpdated={(newStock: number) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === selectedItem.id ? { ...it, stock: newStock } : it,
              ),
            );

            setSnackMessage("Stock updated");
            setSnackOpen(true);
          }}
          onItemDeleted={(deletedId) => {
            setItems((prev) => prev.filter((it) => it.id !== deletedId));

            setSelectedItem(null);
            setSnackMessage("Item deleted");
            setSnackOpen(true);
            setEditOpen(false);
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
    </Box>
  );
}
