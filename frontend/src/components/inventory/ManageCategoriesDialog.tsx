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
import { useState } from "react";

import {
  createActiveCategory,
  deleteActiveCategory,
} from "../../services/inventoryService";

type Category = {
  id: string;
  name: string;
};

type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
  low_stock_threshold: number | null;
  low_stock_notification: boolean;
  category_ids?: string[];
  image_url?: string | null;
  order_id?: string;
};

type ManageCategoriesDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setSnackMessage: (msg: string) => void;
  setSnackOpen: (open: boolean) => void;
};

function extractErrorMessage(err: any, defaultMsg: string): string {
  const data = err?.response?.data;

  if (!data) return defaultMsg;

  if (typeof data === "string") return data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  const targetObj =
    typeof data?.detail === "object" && data.detail !== null
      ? data.detail
      : data;

  if (typeof targetObj === "object" && targetObj !== null) {
    const parts: string[] = [];

    for (const value of Object.values(targetObj)) {
      if (Array.isArray(value)) {
        parts.push(value.join(" "));
      } else if (typeof value === "string") {
        parts.push(value);
      }
    }

    if (parts.length > 0) return parts.join(" | ");
  }

  return defaultMsg;
}

export default function ManageCategoriesDialog({
  open,
  onClose,
  categories,
  setCategories,
  setItems,
  setSnackMessage,
  setSnackOpen,
}: ManageCategoriesDialogProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);

  function handleClose() {
    if (!categorySaving) {
      setCategoryError(null);
      setCategoryName("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage categories</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {categoryError && <Alert severity="error">{categoryError}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="New category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              fullWidth
              disabled={categorySaving}
            />
            <Button
              variant="contained"
              disabled={categorySaving || !categoryName.trim()}
              onClick={async () => {
                setCategoryError(null);
                setCategorySaving(true);
                try {
                  const created = await createActiveCategory(
                    categoryName.trim(),
                  );
                  setCategories((prev) => [...prev, created]);
                  setCategoryName("");
                  setSnackMessage("Category created");
                  setSnackOpen(true);
                } catch (err: any) {
                  setCategoryError(
                    extractErrorMessage(err, "Failed to create category."),
                  );
                } finally {
                  setCategorySaving(false);
                }
              }}
            >
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {categories.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No categories yet.
              </Typography>
            ) : (
              categories.map((category) => (
                <Stack
                  key={category.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>{category.name}</Typography>
                  <Button
                    color="error"
                    disabled={categorySaving}
                    onClick={async () => {
                      setCategoryError(null);
                      try {
                        await deleteActiveCategory(category.id);
                        setCategories((prev) =>
                          prev.filter((c) => c.id !== category.id),
                        );
                        setItems((prev) =>
                          prev.map((item) => ({
                            ...item,
                            category_ids: (item.category_ids || []).filter(
                              (id) => String(id) !== category.id,
                            ),
                          })),
                        );
                        setSnackMessage("Category deleted");
                        setSnackOpen(true);
                      } catch (err: any) {
                        const detail =
                          err?.response?.data?.detail ||
                          "Failed to delete category.";
                        setCategoryError(String(detail));
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={categorySaving}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
