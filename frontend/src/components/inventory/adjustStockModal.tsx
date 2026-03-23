import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { adjustStock } from "../../services/inventoryService";

/**
 * Props for the AdjustStockModal.
 * The parent component (ItemPage) owns the actual item state.
 */
type AdjustStockModalProps = {
  open: boolean;
  itemId: number | string;
  itemName: string;
  currentStock: number;
  onClose: () => void;
  onStockUpdated: (newStock: number) => void;
};

/**
 * Modal for increasing or decreasing the stock of a single item.
 * Backend is the source of truth for all validation rules.
 */
export default function AdjustStockModal({
  open,
  itemId,
  itemName,
  currentStock,
  onClose,
  onStockUpdated,
}: AdjustStockModalProps) {
  // Amount entered by the user (kept as string for TextField)
  const [amount, setAmount] = useState<string>("1");

  // Direction of the stock adjustment
  const [direction, setDirection] = useState<"increase" | "decrease" | null>(
    null,
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("0");
      setDirection(null);
      setError(null);
    }
  }, [open, itemId]);

  // Convert amount to number and validate input
  const amountNumber = Number(amount);
  const amountIsInvalid = !Number.isInteger(amountNumber) || amountNumber < 0;
  const directionIsInvalid = !amountIsInvalid && direction === null;
  const stockWouldBeNegative =
    direction === "decrease" && currentStock - amountNumber < 0;

  /**
   * Called when the user clicks "Update stock".
   * Performs frontend validation and then delegates
   * business rules to the backend.
   */
  async function handleSubmit() {
    setError(null);

    if (amountIsInvalid) {
      setError("Amount must be a positive whole number");
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

    setSaving(true);
    try {
      // Call backend API to adjust stock
      const res = await adjustStock(itemId, direction!, amountNumber);

      // Update stock in parent component only on success
      onStockUpdated(res.stock);

      // Close modal and reset input
      onClose();
      setAmount("1");
    } catch (err: any) {
      const data = err?.response?.data;

      // Case 1: simple message from backend
      if (typeof data?.message === "string") {
        setError(data.message);
        return;
      }

      // Case 2: simple detail string
      if (typeof data?.detail === "string") {
        setError(data.detail);
        return;
      }

      // Case 3: DRF validation error structure
      if (Array.isArray(data?.detail?.non_field_errors)) {
        setError(data.detail.non_field_errors.join(" "));
        return;
      }

      // Fallback for unexpected or network errors
      setError("Failed to update stock");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Close handler for the modal.
   * Prevents closing while a request is in progress.
   */
  function handleClose() {
    if (!saving) {
      setError(null);
      setAmount("0");
      setDirection(null);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Adjust stock</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="subtitle1">{itemName}</Typography>

          <Typography variant="body2" color="text.secondary">
            Current stock: {currentStock}
          </Typography>

          {/* Error message from backend or frontend validation */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Amount input */}
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setAmount("");
                return;
              }

              if (/^\d+$/.test(value)) {
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
            error={amountIsInvalid || stockWouldBeNegative}
            helperText={amountIsInvalid ? "Enter a positive whole number" : " "}
            disabled={saving}
            fullWidth
          />

          {/* Direction selection */}
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={saving}>
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            saving ||
            amountIsInvalid ||
            directionIsInvalid ||
            stockWouldBeNegative
          }
        >
          {saving ? "Saving…" : "Update stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
