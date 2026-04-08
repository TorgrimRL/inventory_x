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
  deleteItem,
  listActiveCategories,
  updateItem,
  uploadItemImage,
} from "../../services/inventoryService";

type Props = {
  open: boolean;
  itemId: number | string;

  initialName: string;
  initialPrice: number;
  currentStock: number;
  initialCategoryIds?: string[];
  initialLowStockThreshold?: number | null;
  initialImageUrl?: string | null;
  canEditDetails: boolean;

  onClose: () => void;

  onItemUpdated: (updated: {
    id: number | string;
    name: string;
    price: number;
    lowStockThreshold: null | number;
    category_ids?: string[];
    imageUrl?: string | null;
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
  initialLowStockThreshold,
  initialImageUrl,
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
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(initialLowStockThreshold == null ? "" : initialLowStockThreshold),
  );

  const [amount, setAmount] = useState<string>("0");
  const [direction, setDirection] = useState<"increase" | "decrease" | null>(
    null,
  );

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialCategoryIds || [],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialImageUrl ?? null,
  );

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setPrice(String(initialPrice));
    setLowStockThreshold(
      initialLowStockThreshold == null ? "" : String(initialLowStockThreshold),
    );
    setAmount("0");
    setDirection(null);
    setSelectedCategoryIds(initialCategoryIds || []);
    setSelectedImage(null);
    setImagePreviewUrl(initialImageUrl ?? null);
    setError(null);

    listActiveCategories()
      .then((list) => setCategories(list))
      .catch(() => setCategories([]));
  }, [
    open,
    initialCategoryIds,
    initialImageUrl,
    initialName,
    initialPrice,
    initialLowStockThreshold,
  ]);

  const priceNumber = useMemo(() => Number(price), [price]);
  const priceIsInvalid = !Number.isFinite(priceNumber) || priceNumber < 0;

  const lowStockThresholdNumber = useMemo(() => {
    const value = lowStockThreshold.trim();
    return value === "" ? null : Number(value);
  }, [lowStockThreshold]);

  const lowStockThresholdIsInvalid =
    lowStockThresholdNumber !== null &&
    (!Number.isInteger(lowStockThresholdNumber) || lowStockThresholdNumber < 0);

  const nameIsInvalid = name.trim().length === 0;

  const amountNumber = useMemo(() => Number(amount), [amount]);
  const wantsStockChange = Number.isFinite(amountNumber) && amountNumber > 0;
  const amountIsInvalid =
    amount.trim() === "" || !Number.isInteger(amountNumber) || amountNumber < 0;

  const directionIsInvalid = wantsStockChange && direction === null;

  const stockWouldBeNegative =
    wantsStockChange &&
    direction === "decrease" &&
    currentStock - amountNumber < 0;

  const initialCategoryKey = (initialCategoryIds || [])
    .map(String)
    .sort()
    .join(",");
  const selectedCategoryKey = [...selectedCategoryIds]
    .map(String)
    .sort()
    .join(",");

  const detailsChanged =
    canEditDetails &&
    (name.trim() !== initialName ||
      Number(priceNumber) !== Number(initialPrice) ||
      initialCategoryKey !== selectedCategoryKey ||
      lowStockThresholdNumber !== (initialLowStockThreshold ?? null));

  const imageChanged = selectedImage !== null;
  const stockChanged = wantsStockChange && direction !== null;
  const hasChanges = detailsChanged || imageChanged || stockChanged;

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
      if (lowStockThresholdIsInvalid) {
        setError("Low Stock Threshold must be a whole number 0 or higher.");
        return;
      }
    }

    if (amountIsInvalid) {
      setError("Amount must be a positive whole number.");
      return;
    }

    if (directionIsInvalid) {
      setError("Please select increase or decrease.");
      return;
    }

    if (stockWouldBeNegative) {
      setError("Stock cannot be negative.");
      return;
    }
    const initialThresholdValue = initialLowStockThreshold ?? null;

    setSaving(true);
    try {
      if (canEditDetails) {
        const trimmed = name.trim();
        const categoryIdsToSave = [...selectedCategoryIds];
        const initialIds = (initialCategoryIds || []).map(String).sort();
        const currentIds = [...categoryIdsToSave].map(String).sort();

        const changed =
          trimmed !== initialName ||
          Number(priceNumber) !== Number(initialPrice) ||
          initialIds.join(",") !== currentIds.join(",") ||
          lowStockThresholdNumber !== initialThresholdValue;

        if (changed) {
          const payload = {
            name: trimmed,
            price: priceNumber,
            low_stock_threshold: lowStockThresholdNumber,
            category_ids: categoryIdsToSave,
          };

          await updateItem(itemId, payload);
          onItemUpdated({
            id: itemId,
            name: trimmed,
            price: priceNumber,
            lowStockThreshold: lowStockThresholdNumber,
            category_ids: payload.category_ids,
          });
        }
      }

      if (selectedImage) {
        const res = await uploadItemImage(itemId, selectedImage);
        onItemUpdated({
          id: itemId,
          name: name.trim(),
          price: priceNumber,
          lowStockThreshold: lowStockThresholdNumber,
          category_ids: selectedCategoryIds,
          imageUrl: res.image_url,
        });
      }

      if (wantsStockChange && direction) {
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
              label="Low stock threshold"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              type="number"
              inputProps={{ step: 1, min: 0 }}
              disabled={saving || !canEditDetails}
              fullWidth
              error={canEditDetails && lowStockThresholdIsInvalid}
              helperText={
                canEditDetails && lowStockThresholdIsInvalid
                  ? "Threshold must be a whole number 0 or higher"
                  : "Leave empty if no threshold should be set"
              }
            />

            {canEditDetails ? (
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
                disabled={saving}
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
            ) : (
              <TextField
                label="Categories"
                value={
                  selectedCategoryIds.length === 0
                    ? "No category added"
                    : selectedCategoryIds
                        .map(
                          (id) =>
                            categories.find(
                              (category) => String(category.id) === String(id),
                            )?.name,
                        )
                        .filter(Boolean)
                        .join(", ") || "No category added"
                }
                disabled
                fullWidth
              />
            )}

            <Stack spacing={1}>
              <Typography variant="subtitle2">Item image</Typography>
              {imagePreviewUrl ? (
                <Box
                  component="img"
                  src={imagePreviewUrl}
                  alt={`${initialName} image preview`}
                  sx={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 0,
                    border: 1,
                    borderColor: "divider",
                  }}
                />
              ) : null}
              <input
                id={`item-image-upload-${itemId}`}
                hidden
                aria-label="Upload image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedImage(file);
                  if (file) {
                    setImagePreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
              <Button
                variant="outlined"
                disabled={saving}
                onClick={() => {
                  const input = document.getElementById(
                    `item-image-upload-${itemId}`,
                  ) as HTMLInputElement | null;
                  input?.click();
                }}
              >
                {imagePreviewUrl ? "Change image" : "Upload image"}
              </Button>
              {selectedImage ? (
                <Typography variant="body2" color="text.secondary">
                  {selectedImage.name}
                </Typography>
              ) : null}
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
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setAmount("");
                  return;
                }
                if (/^\d*$/.test(value)) {
                  setAmount(value);
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              inputProps={{
                min: 0,
                step: 1,
                inputMode: "numeric",
              }}
              disabled={saving}
              fullWidth
              error={amountIsInvalid || stockWouldBeNegative}
              helperText={
                amountIsInvalid ? "Enter a positive whole number" : " "
              }
            />

            <Stack spacing={1.5}>
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

              {directionIsInvalid && (
                <Alert severity="warning">
                  Please select increase or decrease to update stock.
                </Alert>
              )}

              {stockWouldBeNegative && (
                <Alert severity="error">Stock cannot be negative.</Alert>
              )}
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
                !hasChanges ||
                amountIsInvalid ||
                directionIsInvalid ||
                stockWouldBeNegative ||
                (canEditDetails &&
                  (nameIsInvalid ||
                    priceIsInvalid ||
                    lowStockThresholdIsInvalid))
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
