import { Paper, Stack, Typography } from "@mui/material";
import { useMemo } from "react";

type KpiItem = {
  price: number;
  stock: number;
};

type InventoryKpiSummaryProps = {
  allItems: KpiItem[];
  visibleItems: KpiItem[];
  showFilteredMetrics: boolean;
  lowStockThreshold?: number;
};

function totalValue(items: KpiItem[]) {
  return items.reduce((sum, item) => sum + Number(item.price) * item.stock, 0);
}

function lowStockCount(items: KpiItem[], threshold: number) {
  return items.filter((item) => item.stock <= threshold).length;
}

export default function InventoryKpiSummary({
  allItems,
  visibleItems,
  showFilteredMetrics,
  lowStockThreshold = 5,
}: InventoryKpiSummaryProps) {
  const metrics = useMemo(() => {
    const total = {
      value: totalValue(allItems),
      lowStock: lowStockCount(allItems, lowStockThreshold),
      itemCount: allItems.length,
    };

    const filtered = {
      value: totalValue(visibleItems),
      lowStock: lowStockCount(visibleItems, lowStockThreshold),
      itemCount: visibleItems.length,
    };

    return { total, filtered };
  }, [allItems, lowStockThreshold, visibleItems]);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Stack sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Total inventory value
          </Typography>
          <Typography variant="h6">{metrics.total.value}</Typography>
          {showFilteredMetrics && (
            <Typography variant="body2" color="text.secondary">
              Filtered value: {metrics.filtered.value}
            </Typography>
          )}
        </Stack>

        <Stack sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Low-stock count
          </Typography>
          <Typography variant="h6">
            {showFilteredMetrics
              ? `${metrics.filtered.lowStock} / ${metrics.total.lowStock}`
              : metrics.total.lowStock}
          </Typography>
        </Stack>

        <Stack sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">
            Item count
          </Typography>
          <Typography variant="h6">
            {showFilteredMetrics
              ? `${metrics.filtered.itemCount} / ${metrics.total.itemCount}`
              : metrics.total.itemCount}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
