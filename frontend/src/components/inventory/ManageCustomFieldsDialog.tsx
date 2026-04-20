import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  createCustomField,
  deleteCustomField,
} from "../../services/inventoryService";
import type {
  DataTypeEnum,
  InventoryCustomField,
} from "../../types/itemPageTypes";

type ManageCustomFieldsDialogProps = {
  open: boolean;
  onClose: () => void;
  customFields: InventoryCustomField[];
  setCustomFields: React.Dispatch<React.SetStateAction<InventoryCustomField[]>>;
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

export default function ManageCustomFieldsDialog({
  open,
  onClose,
  customFields,
  setCustomFields,
  setSnackMessage,
  setSnackOpen,
}: ManageCustomFieldsDialogProps) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<DataTypeEnum>("text");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldSaving, setFieldSaving] = useState(false);

  function handleClose() {
    if (!fieldSaving) {
      setFieldError(null);
      setFieldName("");
      setFieldType("text");
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage custom fields</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {fieldError && <Alert severity="error">{fieldError}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="New field name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              fullWidth
              disabled={fieldSaving}
            />
            <TextField
              select
              label="Type"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as DataTypeEnum)}
              disabled={fieldSaving}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
            </TextField>
            <Button
              variant="contained"
              disabled={fieldSaving || !fieldName.trim()}
              onClick={async () => {
                setFieldError(null);
                setFieldSaving(true);
                try {
                  const created = await createCustomField(
                    fieldName.trim(),
                    fieldType,
                  );
                  setCustomFields((prev) => [...prev, created]);
                  setFieldName("");
                  setFieldType("text");
                  setSnackMessage("Custom field created");
                  setSnackOpen(true);
                } catch (err: any) {
                  setFieldError(
                    extractErrorMessage(err, "Failed to create custom field."),
                  );
                } finally {
                  setFieldSaving(false);
                }
              }}
            >
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {customFields.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No custom fields yet.
              </Typography>
            ) : (
              customFields.map((field) => (
                <Stack
                  key={field.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>
                    {field.name}{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      ({field.data_type})
                    </Typography>
                  </Typography>
                  <Button
                    color="error"
                    disabled={fieldSaving}
                    onClick={async () => {
                      setFieldError(null);
                      try {
                        await deleteCustomField(field.id);
                        setCustomFields((prev) =>
                          prev.filter((f) => f.id !== field.id),
                        );
                        setSnackMessage("Custom field deleted");
                        setSnackOpen(true);
                      } catch (err: any) {
                        const detail =
                          err?.response?.data?.detail ||
                          "Failed to delete custom field.";
                        setFieldError(String(detail));
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
        <Button onClick={handleClose} disabled={fieldSaving}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
