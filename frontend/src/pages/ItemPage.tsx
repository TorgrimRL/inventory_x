import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  AppBar,
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
  Link,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import EditItemModal from "../components/inventory/editItemModal";
import ItemSearchBar from "../components/inventory/ItemSearchBar";
import ApiClient from "../services/apiClient.ts";
import { getActiveInventory } from "../services/inventoryService";

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

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Live search input (filters as you type)
  const [searchInput, setSearchInput] = useState("");

  const [canEditDetails, setCanEditDetails] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  useEffect(() => {
    loadItems();
    loadRole();
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

  // Live, case-insensitive partial match by name
  const visibleItems = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (q.length === 0) return items;

    return items.filter((it) => (it.name ?? "").toLowerCase().includes(q));
  }, [items, searchInput]);

  function handleClearSearch() {
    setSearchInput("");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ py: 0.75 }}>
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Link
              href="https://inventoryx.td.-uit.no"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}
            >
              <Typography
                variant="h4"
                color="text.primary"
                sx={{ lineHeight: 1 }}
              >
                Inventory X
              </Typography>
            </Link>
          </Container>
        </Toolbar>
      </AppBar>

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
                  {visibleItems.length} item
                  {visibleItems.length === 1 ? "" : "s"}
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

            {/* Add item button centered */}
            <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
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
            ) : visibleItems.length === 0 ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 7 }}>
                <Typography variant="body1">No items found.</Typography>
              </Stack>
            ) : (
              <TableContainer component={Box} sx={{ overflowX: "auto" }}>
                <Table size="medium" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Product name
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Stock
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Price
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {visibleItems.map((item) => (
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
