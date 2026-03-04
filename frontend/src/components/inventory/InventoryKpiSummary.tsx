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

function formatCount(value: number) {
  return new Intl.NumberFormat("nb-NO").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(value);
}

type MetricBlockProps = {
  title: string;
  value: string;
};

function MetricBlock({ title, value }: MetricBlockProps) {
  return (
    <Stack sx={{ minWidth: 180 }}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Stack>
  );
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
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <MetricBlock
            title="Total inventory value"
            value={formatCurrency(metrics.total.value)}
          />
          <MetricBlock
            title="Low-stock count"
            value={formatCount(metrics.total.lowStock)}
          />
          <MetricBlock
            title="Item count"
            value={formatCount(metrics.total.itemCount)}
          />
        </Stack>
      </Paper>

      {showFilteredMetrics && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Information based on filter
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <MetricBlock
              title="Total inventory value"
              value={formatCurrency(metrics.filtered.value)}
            />
            <MetricBlock
              title="Low-stock count"
              value={formatCount(metrics.filtered.lowStock)}
            />
            <MetricBlock
              title="Item count"
              value={formatCount(metrics.filtered.itemCount)}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
