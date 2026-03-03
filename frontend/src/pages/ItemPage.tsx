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
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AdjustStockModal from "../components/inventory/adjustStockModal";
import ItemSearchBar from "../components/inventory/ItemSearchBar";
import ApiClient from "../services/apiClient.ts";

type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
  order_id?: string;
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

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Existing main-branch search
  const [searchInput, setSearchInput] = useState("");

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

  useEffect(() => {
    loadItems();
  }, []);

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function closeDialog() {
    if (!saving) setOpen(false);
  }

  function openAdjustStock(item: InventoryItem) {
    setSelectedItem(item);
    setAdjustOpen(true);
  }

  function closeAdjustStock() {
    setAdjustOpen(false);
    setSelectedItem(null);
  }

  function handleStockUpdated(newStock: number) {
    if (!selectedItem) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id ? { ...item, stock: newStock } : item,
      ),
    );

    setSnackMessage("Stock updated");
    setSnackOpen(true);
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
      await ApiClient.post("/api/inventory/", payload);

      setItems((prev) => [
        ...prev,
        {
          ...payload,
          id: Date.now(),
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

  const displayedItems = useMemo(() => {
    const q = searchInput.trim().toLowerCase();

    const searched =
      q.length === 0
        ? items
        : items.filter((it) => (it.name ?? "").toLowerCase().includes(q));

    const filtered = searched.filter(
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
    sortDirection,
    sortField,
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
  }

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

            <ItemSearchBar
              value={searchInput}
              disabled={loading}
              onChange={setSearchInput}
              onSearch={() => {}}
              onClear={handleClearSearch}
            />

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
                  sx={{ width: 180 }}
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
                  variant="contained"
                  color="inherit"
                  sx={{
                    bgcolor: "grey.300",
                    color: "text.primary",
                    "&:hover": { bgcolor: "grey.400" },
                  }}
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
                <Typography variant="body1">No items found.</Typography>
              </Stack>
            ) : (
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
                    {displayedItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.name}</TableCell>
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
                            onClick={() => openAdjustStock(item)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
        <AdjustStockModal
          open={adjustOpen}
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          currentStock={selectedItem.stock}
          onClose={closeAdjustStock}
          onStockUpdated={handleStockUpdated}
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
