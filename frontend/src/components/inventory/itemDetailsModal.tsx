import { Button, Dialog, DialogTitle, Stack, Typography } from "@mui/material";

type Item = {
  name: string;
  description?: string;
};

type Props = {
  open: boolean;
  item: Item;
  onClose: () => void;
};

export default function ItemDetailsModal({ open, item, onClose }: Props) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Item details</DialogTitle>

      <Stack spacing={2}>
        <Typography>
          <strong>Name:</strong> {item.name}
        </Typography>

        {item.description && (
          <>
            <Typography>
              <strong>Description</strong>
            </Typography>
            <Typography>{item.description}</Typography>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </Stack>
    </Dialog>
  );
}
