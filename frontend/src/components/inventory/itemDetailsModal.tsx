import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  item?: {
    name: string;
    category?: string;
    stock?: number;
    price?: number;
    lowStockThreshold?: number | null | undefined;
    status?: string;
    custom_fields?: string | Record<string, any>;
    description?: string | undefined;
    imageUrl?: string | null;
  };
  customFields?: {
    id: string;
    name: string;
    data_type: string;
  }[];
  onClose: () => void;
};

function getCustomFieldValue(
  itemFields: Record<string, any> | string | null | undefined,
  fieldId: string,
) {
  if (!itemFields) return "—";

  try {
    const parsed =
      typeof itemFields === "string" ? JSON.parse(itemFields) : itemFields;

    const value = parsed?.[fieldId];

    return value !== undefined && value !== null && value !== "" ? value : "—";
  } catch {
    return "—";
  }
}

export default function ItemDetailsModal({
  open,
  item,
  customFields,
  onClose,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Item details</DialogTitle>

        <DialogContent dividers>
          {!item ? (
            <Typography>
              Could not open item details. Please try again.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{ flex: 1, minWidth: 0, maxWidth: "calc(100% - 104px)" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Product name
                  </Typography>
                  <Typography variant="h6">{item.name}</Typography>
                </Box>

                {item.imageUrl ? (
                  <Box
                    component="img"
                    src={item.imageUrl}
                    alt={item.name}
                    onClick={() => setPreviewOpen(true)}
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 1,
                      objectFit: "cover",
                      cursor: "zoom-in",
                      flexShrink: 0,
                    }}
                  />
                ) : null}
              </Stack>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography
                  sx={{
                    maxHeight: 95,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {item.description?.trim() || "No description added"}
                </Typography>
              </div>

              <Divider />

              <div>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography>{item.category || "—"}</Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Stock
                </Typography>
                <Typography>{item.stock ?? "—"}</Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography>
                  {typeof item.price === "number"
                    ? new Intl.NumberFormat("nb-NO", {
                        style: "currency",
                        currency: "NOK",
                      }).format(item.price)
                    : "—"}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography>{item.status || "—"}</Typography>
              </div>

              <div>
                <Typography variant="body2" color="text.secondary">
                  Low stock threshold
                </Typography>
                <Typography>{item.lowStockThreshold ?? "—"}</Typography>
              </div>

              {customFields && customFields.length > 0 && (
                <>
                  <Divider />
                  {customFields.map((field) => {
                    const value = getCustomFieldValue(item.custom_fields, field.id);

                    return (
                      <div key={field.id}>
                        <Typography variant="body2" color="text.secondary">
                          {field.name}
                        </Typography>

                        <Typography>{value}</Typography>
                      </div>
                    );
                  })}
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
      >
        <DialogContent sx={{ p: 1 }}>
          {item?.imageUrl ? (
            <Box
              component="img"
              src={item.imageUrl}
              alt={item.name}
              sx={{
                display: "block",
                maxWidth: "min(90vw, 900px)",
                maxHeight: "80vh",
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
