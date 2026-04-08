import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import {
  adjustStock,
  deleteItem,
  updateItem,
  uploadItemImage,
} from "../../services/inventoryService";

type Props = {
  open: boolean;
  itemId: number | string;

  initialName: string;
  initialPrice: number;
  currentStock: number;
  initialLowStockThreshold?: number | null;
  initialImageUrl?: string | null;
  // owner => true, employee => false
  canEditDetails: boolean;

  onClose: () => void;

  onItemUpdated: (updated: {
    id: number | string;
    name: string;
    price: number;
    lowStockThreshold: null | number;
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
    setSelectedImage(null);
    setImagePreviewUrl(initialImageUrl ?? null);
    setError(null);
  }, [open, initialName, initialPrice, initialLowStockThreshold, initialImageUrl]);

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

  const detailsChanged =
    canEditDetails &&
    (name.trim() !== initialName ||
      Number(priceNumber) !== Number(initialPrice) ||
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
      // 1) Update name/price (only if owner AND changed)
      if (canEditDetails) {
        const trimmed = name.trim();
        const changed =
          trimmed !== initialName ||
          Number(priceNumber) !== Number(initialPrice) ||
          lowStockThresholdNumber !== initialThresholdValue;
        if (changed) {
          await updateItem(itemId, {
            name: trimmed,
            price: priceNumber,
            low_stock_threshold: lowStockThresholdNumber,
          });
          onItemUpdated({
            id: itemId,
            name: trimmed,
            price: priceNumber,
            lowStockThreshold: lowStockThresholdNumber,
          });
        }
      }

      // 2) Upload image (if selected)
      if (selectedImage) {
        const res = await uploadItemImage(itemId, selectedImage);
        onItemUpdated({
          id: itemId,
          name: name.trim(),
          price: priceNumber,
          lowStockThreshold: lowStockThresholdNumber,
          imageUrl: res.image_url,
        });
      }

      // 3) Adjust stock (only if amount > 0)
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
                    borderRadius: 1,
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
