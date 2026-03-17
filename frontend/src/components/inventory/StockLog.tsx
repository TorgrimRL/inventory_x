import {
  Close as CloseIcon,
  History as HistoryIcon,
  HorizontalRule as NeutralIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export interface StockLog {
  id: string | number;
  timestamp: string;
  action: string;
  item_name?: string | null;
  price?: number | string | null;
  direction?: "increase" | "decrease" | string | null;
  amount?: number | string | null;
  current_stock?: number | string | null;
  performed_by_name?: string | null;
}

export interface StockLogDialogProps {
  itemId: string | number | null;
  open: boolean;
  onClose: () => void;
}

export default function StockLogDialog({
  itemId,
  open,
  onClose,
}: StockLogDialogProps) {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && itemId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);

      setError(null);

      fetch(`/api/inventory/${itemId}/stock-log`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch logs");
          return res.json();
        })
        .then((data: StockLog[]) => {
          setLogs(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLogs([]);
    }
  }, [open, itemId]);

  const formatDate = (isoString: string): string => {
    return new Intl.DateTimeFormat("nb-NO", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(isoString));
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price == null) return "-";
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(Number(price));
  };

  // Helper to render skeleton rows for loading state
  const renderSkeletons = () => (
    <Box sx={{ width: "100%", mt: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} animation="wave" height={50} sx={{ mb: 1 }} />
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Item History & Logs
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ minHeight: "300px", bgcolor: "background.default" }}
      >
        {loading && renderSkeletons()}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && logs.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "250px",
              opacity: 0.6,
            }}
          >
            <HistoryIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No logs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There is no recorded history for this item yet.
            </Typography>
          </Box>
        )}

        {!loading && !error && logs.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Price
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Change
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total Stock
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => {
                  const isIncrease = log.direction === "increase";
                  const isDecrease = log.direction === "decrease";

                  return (
                    <TableRow
                      key={log.id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        sx={{ whiteSpace: "nowrap", color: "text.secondary" }}
                      >
                        {formatDate(log.timestamp)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={log.action.replace(/_/g, " ")}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: "capitalize", fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell>{log.item_name || "-"}</TableCell>

                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {formatPrice(log.price)}
                      </TableCell>

                      <TableCell align="center">
                        {isIncrease || isDecrease ? (
                          <Chip
                            size="small"
                            label={`${isIncrease ? "+" : "-"}${log.amount || 0}`}
                            color={isIncrease ? "success" : "error"}
                            variant="outlined"
                            sx={{ fontWeight: "bold", minWidth: "70px" }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            icon={<NeutralIcon />}
                            label="0"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {log.current_stock ?? "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: "text.secondary" }}>
                        {log.performed_by_name || "System"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
