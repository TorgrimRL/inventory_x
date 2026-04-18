import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  item?: {
    name: string;
    category?: string;
    stock?: number;
    price?: number;
    lowStockThreshold?: number | null;
    status?: string;
    description?: string;
    custom_fields?: Record<string, any>;
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
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Item details</DialogTitle>

      <DialogContent dividers>
        {!item ? (
          <Typography>
            Could not open item details. Please try again.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <div>
              <Typography variant="body2" color="text.secondary">
                Product name
              </Typography>
              <Typography variant="h6">{item.name}</Typography>
            </div>

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
                  const value = getCustomFieldValue(
                    item?.custom_fields,
                    field.id,
                  );

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
  );
}
