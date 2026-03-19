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
  lowStockFilterThreshold?: number;
};

function totalValue(items: KpiItem[]) {
  return items.reduce((sum, item) => sum + Number(item.price) * item.stock, 0);
}

function lowStockCount(items: KpiItem[], threshold: number) {
  return items.filter((item) => item.stock <= threshold).length;
}

function averagePrice(items: KpiItem[]) {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + Number(item.price), 0);
  return total / items.length;
}

function totalUnits(items: KpiItem[]) {
  return items.reduce((sum, item) => sum + item.stock, 0);
}

function outOfStockCount(items: KpiItem[]) {
  return items.filter((item) => item.stock === 0).length;
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
  lowStockFilterThreshold = 5,
}: InventoryKpiSummaryProps) {
  const metrics = useMemo(() => {
    const total = {
      value: totalValue(allItems),
      lowStock: lowStockCount(allItems, lowStockFilterThreshold),
      itemCount: allItems.length,
      avgPrice: averagePrice(allItems),
      units: totalUnits(allItems),
      outOfStock: outOfStockCount(allItems),
    };

    const filtered = {
      value: totalValue(visibleItems),
      lowStock: lowStockCount(visibleItems, lowStockFilterThreshold),
      itemCount: visibleItems.length,
      avgPrice: averagePrice(visibleItems),
      units: totalUnits(visibleItems),
      outOfStock: outOfStockCount(visibleItems),
    };

    return { total, filtered };
  }, [allItems, lowStockFilterThreshold, visibleItems]);

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <MetricBlock
            title="Total inventory value"
            value={formatCurrency(metrics.total.value)}
          />
          <MetricBlock
            title="Items with low stock"
            value={formatCount(metrics.total.lowStock)}
          />
          <MetricBlock
            title="Item count"
            value={formatCount(metrics.total.itemCount)}
          />
          <MetricBlock
            title="Average price"
            value={formatCurrency(metrics.total.avgPrice)}
          />
          <MetricBlock
            title="Total units in stock"
            value={formatCount(metrics.total.units)}
          />
          <MetricBlock
            title="Out of stock"
            value={formatCount(metrics.total.outOfStock)}
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
              title="Items with low stock"
              value={formatCount(metrics.filtered.lowStock)}
            />
            <MetricBlock
              title="Item count"
              value={formatCount(metrics.filtered.itemCount)}
            />
            <MetricBlock
              title="Average price"
              value={formatCurrency(metrics.filtered.avgPrice)}
            />
            <MetricBlock
              title="Total units in stock"
              value={formatCount(metrics.filtered.units)}
            />
            <MetricBlock
              title="Out of stock"
              value={formatCount(metrics.filtered.outOfStock)}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
