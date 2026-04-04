import {
  Alert,
  Box,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PATHS } from "../../App";
import {
  getInventoryHistory,
  type InventoryHistoryPoint,
  type InventoryItem,
} from "../../services/inventoryService";

const CATEGORY_COLORS = ["#3f51b5", "#ff9800", "#4caf50", "#e91e63", "#00acc1"];
const YEAR_OPTIONS = [2024, 2025, 2026];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(value);
}

function Metric({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail?: string;
}) {
  return (
    <Stack sx={{ minWidth: 220 }} spacing={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
      {detail ? (
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function DashboardSummaryCard({
  lowStockCount,
  totalValue,
  totalItemCount,
  totalUnits,
  itemsWithoutCategory,
  itemsWithoutThreshold,
}: {
  lowStockCount: number;
  totalValue: number;
  totalItemCount: number;
  totalUnits: number;
  itemsWithoutCategory: number;
  itemsWithoutThreshold: number;
}) {
  const linkSx = {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    borderRadius: 2,
    px: 1,
    py: 0.5,
    "&:hover": { bgcolor: "action.hover" },
  } as const;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        flexWrap="wrap"
        useFlexGap
      >
        <Box component={Link} to={PATHS.ADD_ITEM} sx={linkSx}>
          <Metric title="Low stock items" value={String(lowStockCount)} />
        </Box>
        <Box component={Link} to={PATHS.ADD_ITEM} sx={linkSx}>
          <Metric
            title="Total inventory value"
            value={formatCurrency(totalValue)}
          />
        </Box>
        <Box component={Link} to={PATHS.ADD_ITEM} sx={linkSx}>
          <Metric title="Total items" value={String(totalItemCount)} />
        </Box>
        <Box component={Link} to={PATHS.ADD_ITEM} sx={linkSx}>
          <Metric title="Total units in stock" value={String(totalUnits)} />
        </Box>
        <Box component={Link} to={PATHS.ADD_ITEM} sx={linkSx}>
          <Metric
            title="Items without category"
            value={String(itemsWithoutCategory)}
          />
        </Box>
        <Box component={Link} to={PATHS.ADD_ITEM} sx={linkSx}>
          <Metric
            title="Items without threshold"
            value={String(itemsWithoutThreshold)}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

function buildPieSegments(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  let currentAngle = -Math.PI / 2;

  return values.map((value) => {
    const angle = total === 0 ? 0 : (value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = 50 + 42 * Math.cos(startAngle);
    const y1 = 50 + 42 * Math.sin(startAngle);
    const x2 = 50 + 42 * Math.cos(endAngle);
    const y2 = 50 + 42 * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const labelAngle = startAngle + angle / 2;
    const labelX = 50 + 27 * Math.cos(labelAngle);
    const labelY = 50 + 27 * Math.sin(labelAngle);

    return {
      path: `M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`,
      labelX,
      labelY,
    };
  });
}

function CategoryCompositionCard({
  composition,
}: {
  composition: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}) {
  const pieSegments = useMemo(
    () => buildPieSegments(composition.map((segment) => segment.count)),
    [composition],
  );

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Inventory composition by category
        </Typography>
        <Stack spacing={2} alignItems="center">
          <Box data-testid="category-composition-chart">
            <svg
              width="260"
              height="260"
              viewBox="0 0 100 100"
              aria-label="Category composition pie chart"
            >
              {pieSegments.map((segment, index) => (
                <g key={`${composition[index]?.label}-${index}`}>
                  <path
                    d={segment.path}
                    fill={composition[index]?.color}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                  <text
                    x={segment.labelX}
                    y={segment.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="7"
                    fill="#fff"
                    fontWeight="700"
                  >
                    {composition[index]?.percentage}%
                  </text>
                </g>
              ))}
            </svg>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
            justifyContent="center"
            useFlexGap
          >
            {composition.map((segment) => (
              <Stack
                key={segment.label}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: segment.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">
                  {segment.label} ({segment.count}, {segment.percentage}%)
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function CategoryValueDistributionCard({
  values,
}: {
  values: Array<{ label: string; value: number; color: string }>;
}) {
  const maxValue = Math.max(...values.map((entry) => entry.value), 1);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Category value distribution
        </Typography>
        <Stack spacing={1.5}>
          {values.map((entry) => (
            <Stack key={entry.label} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2">{entry.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(entry.value)}
                </Typography>
              </Stack>
              <Box
                sx={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${(entry.value / maxValue) * 100}%`,
                    height: "100%",
                    bgcolor: entry.color,
                  }}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

function SimpleItemListCard({
  title,
  items,
  valueFormatter,
}: {
  title: string;
  items: Array<{ id: number | string; name: string; value: number }>;
  valueFormatter: (value: number) => string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No data available.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {items.map((item, index) => (
              <Stack
                key={item.id}
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="body2">
                  {index + 1}. {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {valueFormatter(item.value)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function InventoryValueLineChartCard({
  selectedYear,
  setSelectedYear,
  monthlyValues,
}: {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  monthlyValues: Array<{ label: string; value: number }>;
}) {
  const theme = useTheme();
  const axisLabelColor = theme.palette.text.primary;

  const lineChartMax = useMemo(
    () => Math.max(...monthlyValues.map((point) => point.value), 1),
    [monthlyValues],
  );

  const linePath = useMemo(() => {
    return monthlyValues
      .map((point, index) => {
        const x = 20 + (index / (monthlyValues.length - 1 || 1)) * 280;
        const y = 120 - (point.value / lineChartMax) * 90;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [lineChartMax, monthlyValues]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Inventory value over time
          </Typography>
          <TextField
            select
            size="small"
            label="Year"
            value={String(selectedYear)}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ minWidth: 120 }}
          >
            {YEAR_OPTIONS.map((year) => (
              <MenuItem key={year} value={String(year)}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Box data-testid="inventory-value-line-chart">
          <svg
            width="100%"
            height="180"
            viewBox="0 0 320 150"
            aria-label="Inventory value line chart"
          >
            <line
              x1="20"
              y1="120"
              x2="300"
              y2="120"
              stroke="#c4c4c4"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="20"
              x2="20"
              y2="120"
              stroke="#c4c4c4"
              strokeWidth="1"
            />
            <path
              d={linePath}
              fill="none"
              stroke="#3f51b5"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {monthlyValues.map((point, index) => {
              const x = 20 + (index / (monthlyValues.length - 1 || 1)) * 280;
              const y = 120 - (point.value / lineChartMax) * 90;
              return (
                <g key={point.label}>
                  <circle cx={x} cy={y} r="3" fill="#3f51b5" />
                  <text
                    x={x}
                    y="138"
                    textAnchor="middle"
                    fontSize="10"
                    fill={axisLabelColor}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function DashboardChartsCard({
  items,
  categoryNameById,
}: {
  items: InventoryItem[];
  categoryNameById: Map<string, string>;
}) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [historyPoints, setHistoryPoints] = useState<InventoryHistoryPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    void getInventoryHistory(selectedYear)
      .then((data) => {
        if (!cancelled) setHistoryPoints(data);
      })
      .catch(() => {
        if (!cancelled) setHistoryPoints([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  const metrics = useMemo(() => {
    const categoryCountTotals = new Map<string, number>();
    const categoryValueTotals = new Map<string, number>();

    for (const item of items) {
      const categories = item.category_names?.length
        ? item.category_names
        : item.category_ids?.length
          ? item.category_ids.map(
              (id) => categoryNameById.get(String(id)) ?? String(id),
            )
          : ["Uncategorized"];

      const itemValue = Number(item.price) * item.stock;

      for (const category of categories) {
        categoryCountTotals.set(
          category,
          (categoryCountTotals.get(category) ?? 0) + 1,
        );
        categoryValueTotals.set(
          category,
          (categoryValueTotals.get(category) ?? 0) + itemValue,
        );
      }
    }

    const compositionBase = [...categoryCountTotals.entries()];
    const compositionTotal = compositionBase.reduce(
      (sum, [, count]) => sum + count,
      0,
    );
    const composition = compositionBase.map(([label, count], index) => ({
      label,
      count,
      percentage:
        compositionTotal === 0
          ? 0
          : Math.round((count / compositionTotal) * 100),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));

    const categoryValueDistribution = [...categoryValueTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], index) => ({
        label,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));

    const monthlyValues =
      historyPoints.length > 0
        ? historyPoints.map((point) => ({
            label: point.month,
            value: point.value,
          }))
        : MONTH_LABELS.map((label) => ({
            label,
            value: 0,
          }));

    const topInventoryValueItems = [...items]
      .map((item) => ({
        id: item.id,
        name: item.name,
        value: Number(item.price) * item.stock,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const lowestStockItems = [...items]
      .filter((item) => item.stock >= 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        value: item.stock,
      }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 5);

    return {
      composition,
      categoryValueDistribution,
      monthlyValues,
      topInventoryValueItems,
      lowestStockItems,
    };
  }, [categoryNameById, historyPoints, items]);

  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Alert severity="info">Not enough data to show charts.</Alert>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", xl: "row" }} spacing={3}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CategoryCompositionCard composition={metrics.composition} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CategoryValueDistributionCard
            values={metrics.categoryValueDistribution}
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={3}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SimpleItemListCard
            title="Top inventory value items"
            items={metrics.topInventoryValueItems}
            valueFormatter={(value) => formatCurrency(value)}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SimpleItemListCard
            title="Lowest stock items"
            items={metrics.lowestStockItems}
            valueFormatter={(value) => `${value} units`}
          />
        </Box>
      </Stack>

      <InventoryValueLineChartCard
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        monthlyValues={metrics.monthlyValues}
      />
    </Stack>
  );
}
