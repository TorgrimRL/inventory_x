import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import type { ItemCategory } from "../../services/inventoryService";
import {
  adjustStock,
  createActiveCategory,
  deleteItem,
  listActiveCategories,
  updateItem,
} from "../../services/inventoryService";

type Props = {
  open: boolean;
  itemId: number | string;

  initialName: string;
  initialPrice: number;
  currentStock: number;
  initialCategoryIds?: string[];

  // owner => true, employee => false
  canEditDetails: boolean;

  onClose: () => void;

  onItemUpdated: (updated: {
    id: number | string;
    name: string;
    price: number;
    category_ids?: string[];
  }) => void;
  onStockUpdated: (newStock: number) => void;

  onItemDeleted: (id: number | string) => void;
};

function extractError(err: any, fallback: string) {
  const data = err?.response?.data;

  if (!data) return fallback;
  if (typeof data === "string") return data;

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  const nonField = data?.detail?.non_field_errors;
  if (Array.isArray(nonField) && nonField.length > 0) {
    return nonField.join(" ");
  }

  return fallback;
}

export default function EditItemModal({
  open,
  itemId,
  initialName,
  initialPrice,
  currentStock,
  initialCategoryIds,
  canEditDetails,
  onClose,
  onItemUpdated,
  onStockUpdated,
  onItemDeleted,
}: Props) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(String(initialPrice));

  const [amount, setAmount] = useState<string>("0");
  const [direction, setDirection] = useState<"increase" | "decrease">(
    "increase",
  );

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialCategoryIds || [],
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setPrice(String(initialPrice));
    setAmount("0");
    setDirection("increase");
    setSelectedCategoryIds(initialCategoryIds || []);
    setNewCategoryName("");
    setError(null);

    listActiveCategories()
      .then((list) => setCategories(list))
      .catch(() => setCategories([]));
  }, [open, initialCategoryIds, initialName, initialPrice]);

  const priceNumber = useMemo(() => Number(price), [price]);
  const priceIsInvalid = !Number.isFinite(priceNumber) || priceNumber < 0;
  const nameIsInvalid = name.trim().length === 0;

  const amountNumber = useMemo(() => Number(amount), [amount]);
  const wantsStockChange = Number.isFinite(amountNumber) && amountNumber > 0;
  const amountIsInvalid =
    wantsStockChange && (!Number.isInteger(amountNumber) || amountNumber <= 0);

  function handleClose() {
    if (!saving) {
      setError(null);
      onClose();
    }
  }

  async function handleSave() {
    setError(null);

    if (canEditDetails) {
      if (nameIsInvalid) {
        setError("Name is required.");
        return;
      }
      if (priceIsInvalid) {
        setError("Price must be a non-negative number.");
        return;
      }
    }

    if (amountIsInvalid) {
      setError("Amount must be a positive whole number.");
      return;
    }

    setSaving(true);
    try {
      // 1) Update name/price (only if owner AND changed)
      if (canEditDetails) {
        const trimmed = name.trim();

        let categoryIdsToSave = [...selectedCategoryIds];
        const newCategoryTrimmed = newCategoryName.trim();
        if (newCategoryTrimmed.length > 0) {
          const createdCategory =
            await createActiveCategory(newCategoryTrimmed);
          setCategories((prev) => [...prev, createdCategory]);
          categoryIdsToSave = [
            ...new Set([...categoryIdsToSave, createdCategory.id]),
          ];
          setSelectedCategoryIds(categoryIdsToSave);
          setNewCategoryName("");
        }

        const initialIds = (initialCategoryIds || []).map(String).sort();
        const currentIds = [...categoryIdsToSave].map(String).sort();

        const changed =
          trimmed !== initialName ||
          Number(priceNumber) !== Number(initialPrice) ||
          initialIds.join(",") !== currentIds.join(",");

        if (changed) {
          const payload = {
            name: trimmed,
            price: priceNumber,
            category_ids: categoryIdsToSave,
          };

          await updateItem(itemId, payload);
          onItemUpdated({
            id: itemId,
            name: trimmed,
            price: priceNumber,
            category_ids: payload.category_ids,
          });
        }
      }

      // 2) Adjust stock (only if amount > 0)
      if (wantsStockChange) {
        const res = await adjustStock(itemId, direction, amountNumber);
        onStockUpdated(res.stock);
      }

      onClose();
    } catch (err: any) {
      setError(extractError(err, "Failed to save changes."));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setError(null);
    setSaving(true);
    try {
      await deleteItem(itemId);

      if (typeof onItemDeleted === "function") {
        onItemDeleted(itemId);
      }

      setDeleteConfirmOpen(false);
      onClose();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(extractError(err, "Failed to delete item."));
      setDeleteConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit item</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {!canEditDetails && (
              <Alert severity="info">
                Only owners can edit name and price. Stock can still be
                adjusted.
              </Alert>
            )}

            <Typography variant="subtitle1">Details</Typography>

            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving || !canEditDetails}
              fullWidth
              required
              error={canEditDetails && nameIsInvalid}
              helperText={
                canEditDetails && nameIsInvalid ? "Name is required" : " "
              }
            />

            <TextField
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              disabled={saving || !canEditDetails}
              fullWidth
              required
              error={canEditDetails && priceIsInvalid}
              helperText={
                canEditDetails && priceIsInvalid
                  ? "Price cannot be negative"
                  : " "
              }
            />

            <TextField
              select
              label="Categories"
              value={selectedCategoryIds}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCategoryIds(
                  Array.isArray(value) ? value : String(value).split(","),
                );
              }}
              disabled={saving || !canEditDetails}
              fullWidth
              helperText="Select one or more categories for this inventory"
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
                    checked={selectedCategoryIds.includes(category.id)}
                    size="small"
                  />
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="New category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={saving || !canEditDetails}
                fullWidth
                helperText="Create category if it does not exist"
              />
              <Button
                variant="outlined"
                disabled={saving || !canEditDetails || !newCategoryName.trim()}
                onClick={async () => {
                  try {
                    const created = await createActiveCategory(
                      newCategoryName.trim(),
                    );
                    setCategories((prev) => [...prev, created]);
                    setSelectedCategoryIds((prev) =>
                      prev.includes(created.id) ? prev : [...prev, created.id],
                    );
                    setNewCategoryName("");
                  } catch {
                    setError("Failed to create category.");
                  }
                }}
              >
                Add
              </Button>
            </Stack>

            <Divider />

            <Typography variant="subtitle1">Stock</Typography>

            <Typography variant="body2" color="text.secondary">
              Current stock: {currentStock}
            </Typography>

            <TextField
              label="Amount (0 = no change)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              disabled={saving}
              fullWidth
              error={amountIsInvalid}
              helperText={
                amountIsInvalid ? "Enter a positive whole number" : " "
              }
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant={direction === "increase" ? "contained" : "outlined"}
                onClick={() => setDirection("increase")}
                disabled={saving}
                fullWidth
              >
                Increase
              </Button>

              <Button
                variant={direction === "decrease" ? "contained" : "outlined"}
                onClick={() => setDirection("decrease")}
                disabled={saving}
                fullWidth
              >
                Decrease
              </Button>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Box>
            {canEditDetails && (
              <Button
                color="error"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={saving}
              >
                Delete Item
              </Button>
            )}
          </Box>

          <Box>
            <Button onClick={handleClose} color="inherit" disabled={saving}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              variant="contained"
              disabled={
                saving ||
                amountIsInvalid ||
                (canEditDetails && (nameIsInvalid || priceIsInvalid))
              }
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={saving}
          >
            {saving ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
