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
  FormControlLabel,
  ListItemText,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import ApiClient from "../../services/apiClient";
import type { ItemCategory } from "../../services/inventoryService";
import {
  adjustStock,
  createItem,
  deleteItem,
  listActiveCategories,
  updateItem,
} from "../../services/inventoryService";
import type {
  InventoryCustomField,
  InventoryItem,
} from "../../types/itemPageTypes";
import { toMediaUrl } from "../../utils/mediaUrl";

type Props = {
  open: boolean;
  mode: "add" | "edit";
  itemId?: number | string;

  initialName?: string;
  initialPrice?: number;
  currentStock?: number;
  initialCategoryIds?: string[];
  initialLowStockThreshold?: number | null;
  initialImageUrl?: string | null;
  low_stock_notification?: boolean;
  initialCustomFields?: string | Record<string, any>;
  canEditDetails: boolean;
  description?: string;

  onClose: () => void;

  onItemCreated?: (item: InventoryItem) => void;
  onItemUpdated?: (updated: {
    id: number | string;
    name: string;
    price: number;
    low_stock_threshold: null | number;
    low_stock_notification: boolean;
    category_ids?: string[];
    custom_fields?: Record<string, any>;
    description?: string;
    image_url?: string | null;
  }) => void;
  onStockUpdated?: (newStock: number) => void;
  onItemDeleted?: (id: number | string) => void;
};

function extractError(err: any, fallback: string) {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  const nonField = data?.detail?.non_field_errors;
  if (Array.isArray(nonField) && nonField.length > 0) return nonField.join(" ");
  return fallback;
}

const EMPTY_ARRAY: string[] = [];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

export default function ItemFormModal({
  open,
  mode,
  itemId,
  initialName = "",
  description = "",
  initialPrice = 0,
  initialLowStockThreshold = null,
  initialImageUrl = null,
  low_stock_notification = false,
  currentStock = 0,
  initialCategoryIds = EMPTY_ARRAY,
  initialCustomFields,
  canEditDetails,
  onClose,
  onItemCreated,
  onItemUpdated,
  onStockUpdated,
  onItemDeleted,
}: Props) {
  const isAdd = mode === "add";

  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(String(initialPrice));
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialLowStockThreshold == null ? "" : String(initialLowStockThreshold),
  );
  const [notification, setNotifications] = useState(
    Boolean(low_stock_notification),
  );

  const [amount, setAmount] = useState<string>("0");
  const [direction, setDirection] = useState<"increase" | "decrease" | null>(
    null,
  );

  const [initialStock, setInitialStock] = useState<string>("0");

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState<string[]>(initialCategoryIds);

  const [customFieldsDef, setCustomFieldsDef] = useState<
    InventoryCustomField[]
  >([]);
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, any>
  >({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [desc, setDescription] = useState(description);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialImageUrl,
  );
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setPrice(String(initialPrice));
    setLowStockThreshold(
      initialLowStockThreshold == null ? "" : String(initialLowStockThreshold),
    );
    setNotifications(Boolean(low_stock_notification));
    setAmount("0");
    setInitialStock("0");
    setDirection(null);
    setSelectedCategoryIds(initialCategoryIds);
    setError(null);
    setDescription(description || "");
    setSelectedImage(null);
    setCurrentImageUrl(initialImageUrl);
    setRemoveImage(false);

    let parsed = {};
    if (typeof initialCustomFields === "string") {
      try {
        parsed = JSON.parse(initialCustomFields);
      } catch (err) {
        console.error("Failed to parse custom fields:", err);
      }
    } else if (initialCustomFields) {
      parsed = { ...initialCustomFields };
    }
    setCustomFieldValues(parsed);

    listActiveCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    ApiClient.get("/api/inventory/active/fields/")
      .then((res) => setCustomFieldsDef(res.data?.data || res.data || []))
      .catch(() => {
        setCustomFieldsDef([]);
        setError("Warning: Failed to load custom fields.");
      });
  }, [
    open,
    mode,
    itemId,
    initialName,
    initialPrice,
    initialLowStockThreshold,
    low_stock_notification,
    initialCategoryIds,
    initialCustomFields,
    description,
    initialImageUrl,
  ]);

  const objectUrlRef = useRef<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!selectedImage) {
      setLocalPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedImage);
    objectUrlRef.current = nextUrl;
    setLocalPreviewUrl(nextUrl);

    return () => {
      if (objectUrlRef.current === nextUrl) {
        URL.revokeObjectURL(nextUrl);
        objectUrlRef.current = null;
      }
    };
  }, [selectedImage]);

  const previewUrl =
    localPreviewUrl ?? (removeImage ? null : toMediaUrl(currentImageUrl));

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

  const initialStockNumber = Number(initialStock);
  const initialStockIsInvalid =
    !Number.isInteger(initialStockNumber) || initialStockNumber < 0;

  const amountNumber = useMemo(() => Number(amount), [amount]);
  const wantsStockChange = Number.isFinite(amountNumber) && amountNumber > 0;
  const amountIsInvalid =
    amount.trim() === "" || !Number.isInteger(amountNumber) || amountNumber < 0;
  const directionIsInvalid = wantsStockChange && direction === null;
  const stockWouldBeNegative =
    wantsStockChange &&
    direction === "decrease" &&
    currentStock - amountNumber < 0;

  const initialCategoryKey = initialCategoryIds.map(String).sort().join(",");
  const selectedCategoryKey = [...selectedCategoryIds]
    .map(String)
    .sort()
    .join(",");

  const currentCustomFieldsKey = JSON.stringify(customFieldValues);
  const initialCustomFieldsKey = JSON.stringify(
    typeof initialCustomFields === "string"
      ? (() => {
          try {
            return JSON.parse(initialCustomFields);
          } catch {
            return {};
          }
        })()
      : initialCustomFields || {},
  );

  const detailsChanged =
    isAdd ||
    (canEditDetails &&
      (name.trim() !== initialName ||
        Number(priceNumber) !== Number(initialPrice) ||
        lowStockThresholdNumber !== (initialLowStockThreshold ?? null) ||
        initialCategoryKey !== selectedCategoryKey ||
        notification !== Boolean(low_stock_notification) ||
        initialCustomFieldsKey !== currentCustomFieldsKey ||
        desc.trim() !== (description || "").trim() ||
        selectedImage !== null ||
        removeImage));
  const stockChanged = wantsStockChange && direction !== null;
  const hasChanges = isAdd || detailsChanged || stockChanged;

  function handleClose() {
    if (!saving) {
      setError(null);
      onClose();
    }
  }

  function validateSelectedImage(file: File | null): string | null {
    if (!file) return null;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "File type not supported";
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      return "File is too large (max 5 MB)";
    }

    return null;
  }

  async function handleSave() {
    setError(null);

    if (canEditDetails || isAdd) {
      if (nameIsInvalid) return setError("Name is required.");
      if (priceIsInvalid)
        return setError("Price must be a non-negative number.");
      if (lowStockThresholdIsInvalid)
        return setError(
          "Low Stock Threshold must be a whole number 0 or higher.",
        );
    }

    if (isAdd && initialStockIsInvalid)
      return setError("Initial stock must be a positive whole number.");

    if (!isAdd) {
      if (amountIsInvalid)
        return setError("Amount must be a positive whole number.");
      if (directionIsInvalid)
        return setError("Please select increase or decrease.");
      if (stockWouldBeNegative) return setError("Stock cannot be negative.");
    }

    const imageValidationError = validateSelectedImage(selectedImage);
    if (imageValidationError) return setError(imageValidationError);

    setSaving(true);
    try {
      if (isAdd) {
        const payload = {
          name: name.trim(),
          price: priceNumber,
          description: desc.trim(),
          stock: initialStockNumber,
          low_stock_threshold: lowStockThresholdNumber,
          low_stock_notification: notification,
          category_ids: [...selectedCategoryIds],
          custom_fields: customFieldValues,
          image: selectedImage,
          remove_image: removeImage,
        };
        const createdData = await createItem(payload);
        setCurrentImageUrl(createdData?.image_url ?? null);
        if (onItemCreated) onItemCreated(createdData);
        onClose();
        return;
      }

      // Edit Mode
      if (canEditDetails && detailsChanged && itemId) {
        const payload = {
          name: name.trim(),
          price: priceNumber,
          description: desc.trim(),
          low_stock_threshold: lowStockThresholdNumber,
          low_stock_notification: notification,
          category_ids: [...selectedCategoryIds],
          custom_fields: customFieldValues,
          image: selectedImage,
          remove_image: removeImage,
        };
        const updatedResponse = await updateItem(itemId, payload);
        const updatedImageUrl =
          updatedResponse?.image_url ?? (removeImage ? null : currentImageUrl);
        setCurrentImageUrl(updatedImageUrl);
        setSelectedImage(null);
        setRemoveImage(false);

        if (onItemUpdated) {
          onItemUpdated({
            id: itemId,
            name: payload.name,
            price: payload.price,
            low_stock_threshold: payload.low_stock_threshold,
            low_stock_notification: payload.low_stock_notification,
            category_ids: payload.category_ids,
            custom_fields: payload.custom_fields,
            description: desc.trim(),
            image_url: updatedImageUrl,
          });
        }
      }

      if (wantsStockChange && direction && itemId) {
        const res = await adjustStock(itemId, direction, amountNumber);
        if (onStockUpdated) onStockUpdated(res.stock);
      }

      onClose();
    } catch (err: any) {
      setError(extractError(err, "Failed to save changes."));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (isAdd || !itemId) return;
    setError(null);
    setSaving(true);
    try {
      await deleteItem(itemId);
      if (onItemDeleted) onItemDeleted(itemId);
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err: any) {
      setError(extractError(err, "Failed to delete item."));
      setDeleteConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isAdd ? "Add new item" : "Edit item"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {!isAdd && !canEditDetails && (
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
              disabled={saving || (!isAdd && !canEditDetails)}
              fullWidth
              required
              autoFocus={isAdd}
              error={
                (isAdd || canEditDetails) &&
                nameIsInvalid &&
                name !== initialName
              }
              helperText={
                (isAdd || canEditDetails) &&
                nameIsInvalid &&
                name !== initialName
                  ? "Name is required"
                  : " "
              }
            />
            <TextField
              label="Description"
              value={desc}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              maxRows={3}
              disabled={saving || (!isAdd && !canEditDetails)}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                inputProps={{ step: "0.01", min: 0 }}
                disabled={saving || (!isAdd && !canEditDetails)}
                fullWidth
                required
                error={(isAdd || canEditDetails) && priceIsInvalid}
                helperText={
                  (isAdd || canEditDetails) && priceIsInvalid
                    ? "Price cannot be negative"
                    : " "
                }
              />

              {isAdd && (
                <TextField
                  label="Initial stock"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  type="number"
                  inputProps={{ step: "1", min: 0 }}
                  required
                  fullWidth
                  disabled={saving}
                  error={initialStockIsInvalid}
                  helperText={
                    initialStockIsInvalid ? "Stock cannot be negative" : " "
                  }
                />
              )}
            </Stack>

            <TextField
              label="Low stock threshold"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              type="number"
              inputProps={{ step: 1, min: 0 }}
              disabled={saving || (!isAdd && !canEditDetails)}
              fullWidth
              error={(isAdd || canEditDetails) && lowStockThresholdIsInvalid}
              helperText={
                (isAdd || canEditDetails) && lowStockThresholdIsInvalid
                  ? "Threshold must be a whole number 0 or higher"
                  : "Leave empty if no threshold should be set"
              }
            />

            {(isAdd || canEditDetails || previewUrl) && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Image
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allowed formats: JPG, JPEG, PNG, WEBP. Max size: 5 MB.
                </Typography>
                {previewUrl ? (
                  <Box
                    sx={{
                      display: "inline-flex",
                      flexDirection: "column",
                      gap: 0.5,
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      component="img"
                      src={previewUrl}
                      alt={name || initialName || "Item image"}
                      sx={{
                        width: { xs: "100%", sm: 220 },
                        maxWidth: 220,
                        height: { xs: 220, sm: 220 },
                        borderRadius: 1,
                        objectFit: "cover",
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        backgroundColor: "background.paper",
                      }}
                    />
                    {selectedImage ? (
                      <Typography variant="caption" color="text.secondary">
                        Preview of selected image, shown before you save
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}
                <Stack direction="row" spacing={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={saving || (!isAdd && !canEditDetails)}
                    aria-disabled={
                      !isAdd && !canEditDetails ? "true" : undefined
                    }
                  >
                    {previewUrl ? "Change image" : "Upload image"}
                    <input
                      hidden
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        const validationError = validateSelectedImage(file);

                        if (validationError) {
                          setSelectedImage(null);
                          setError(validationError);
                          return;
                        }

                        setError(null);
                        setSelectedImage(file);
                        setRemoveImage(false);
                      }}
                    />
                  </Button>
                  {previewUrl && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      disabled={saving || (!isAdd && !canEditDetails)}
                      onClick={() => {
                        setSelectedImage(null);
                        setRemoveImage(true);
                      }}
                    >
                      Remove image
                    </Button>
                  )}
                </Stack>
              </Stack>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={notification}
                  onChange={(e) => setNotifications(e.target.checked)}
                  disabled={saving || (!isAdd && !canEditDetails)}
                  color="primary"
                />
              }
              label="Enable low stock mail notifications for this item"
            />

            {isAdd || canEditDetails ? (
              <TextField
                select
                label="Categories"
                value={selectedCategoryIds}
                onChange={(e) =>
                  setSelectedCategoryIds(
                    Array.isArray(e.target.value)
                      ? e.target.value
                      : String(e.target.value).split(","),
                  )
                }
                disabled={saving}
                fullWidth
                helperText="Select one or more categories"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const ids = selected as string[];
                    if (ids.length === 0) return "No category added";
                    return ids
                      .map(
                        (id) => categories.find((c) => c.id === id)?.name || id,
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
                            categories.find((c) => String(c.id) === String(id))
                              ?.name,
                        )
                        .filter(Boolean)
                        .join(", ") || "No category added"
                }
                disabled
                fullWidth
              />
            )}

            {customFieldsDef.map((field) => (
              <TextField
                key={field.id}
                label={field.name}
                value={customFieldValues[field.id] ?? ""}
                onChange={(e) =>
                  setCustomFieldValues((prev) => ({
                    ...prev,
                    [field.id]: e.target.value,
                  }))
                }
                type={field.data_type === "number" ? "number" : "text"}
                disabled={saving || (!isAdd && !canEditDetails)}
                fullWidth
              />
            ))}

            {!isAdd && (
              <>
                <Divider />
                <Typography variant="subtitle1">Stock Adjustment</Typography>
                <Typography variant="body2" color="text.secondary">
                  Current stock: {currentStock}
                </Typography>

                <TextField
                  label="Amount (0 = no change)"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") return setAmount("");
                    if (/^\d*$/.test(value)) setAmount(value);
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", ".", ","].includes(e.key))
                      e.preventDefault();
                  }}
                  inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
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
                      variant={
                        direction === "increase" ? "contained" : "outlined"
                      }
                      onClick={() => setDirection("increase")}
                      disabled={saving}
                      fullWidth
                    >
                      Increase
                    </Button>
                    <Button
                      variant={
                        direction === "decrease" ? "contained" : "outlined"
                      }
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
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Box>
            {!isAdd && canEditDetails && (
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
                (!isAdd &&
                  (amountIsInvalid ||
                    directionIsInvalid ||
                    stockWouldBeNegative)) ||
                ((isAdd || canEditDetails) &&
                  (nameIsInvalid ||
                    priceIsInvalid ||
                    lowStockThresholdIsInvalid)) ||
                (isAdd && initialStockIsInvalid)
              }
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {!isAdd && (
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
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={saving}
            >
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
      )}
    </>
  );
}
