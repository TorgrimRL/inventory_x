import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import ApiClient from "../../services/apiClient";
import AdjustStockModal from "./adjustStockModal.tsx";

type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  low_stock_threshold: number | null;
};

function isLowStock(item: InventoryItem) {
  return (
    item.low_stock_threshold != null && item.stock <= item.low_stock_threshold
  );
}

export default function LowStockWarningsCard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      setError(null);

      try {
        const res = await ApiClient.get("/api/inventory/");
        const data = res.data;
        setItems((data.data || data) as InventoryItem[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load low-stock warnings.");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const lowStockItems = useMemo(() => {
    return [...items].filter(isLowStock).sort((a, b) => {
      if (a.stock !== b.stock) return a.stock - b.stock;
      return a.name.localeCompare(b.name);
    });
  }, [items]);

  function handleOpenAdjust(item: InventoryItem) {
    setSelectedItem(item);
    setAdjustOpen(true);
  }

  function handleCloseAdjust() {
    setAdjustOpen(false);
  }

  function handleStockUpdated(newStock: number) {
    if (!selectedItem) return;

    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id ? { ...it, stock: newStock } : it,
      ),
    );

    setSelectedItem((prev) => (prev ? { ...prev, stock: newStock } : prev));
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Low-stock warnings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loading
                ? "Loading warnings..."
                : `${lowStockItems.length} item${
                    lowStockItems.length === 1 ? "" : "s"
                  } need attention`}
            </Typography>
          </Box>

          {loading ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={18} />
              <Typography color="text.secondary">
                Loading low-stock warnings...
              </Typography>
            </Stack>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : lowStockItems.length === 0 ? (
            <Alert severity="success">No low-stock warnings.</Alert>
          ) : (
            <Stack
              spacing={1.25}
              sx={{
                maxHeight: 320,
                overflowY: "auto",
                pr: 1.5,
                scrollbarGutter: "stable",
              }}
            >
              {lowStockItems.map((item) => (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => handleOpenAdjust(item)}
                  sx={{
                    width: "100%",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    minHeight: 72,
                    bgcolor: "background.paper",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    outline: "none",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "text.secondary",
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} color="text.primary">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {item.stock} / Threshold:{" "}
                      {item.low_stock_threshold}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ flexShrink: 0, fontWeight: 600 }}
                  >
                    Adjust
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      {selectedItem && (
        <AdjustStockModal
          open={adjustOpen}
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          currentStock={selectedItem.stock}
          onClose={handleCloseAdjust}
          onStockUpdated={handleStockUpdated}
        />
      )}
    </>
  );
}
