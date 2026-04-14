import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PATHS } from "../App";
import DashboardChartsCard, {
  DashboardSummaryCard,
} from "../components/inventory/DashboardChartsCard.tsx";
import LowStockWarningsCard from "../components/inventory/LowStockWarningsCard.tsx";
import {
  type ActiveInventory,
  getActiveInventory,
  type InventoryItem,
  listActiveCategories,
  listInventoryItems,
} from "../services/inventoryService";

function isLowStock(item: InventoryItem) {
  return (
    item.low_stock_threshold != null && item.stock <= item.low_stock_threshold
  );
}

const Dashboard = () => {
  const [active, setActive] = useState<ActiveInventory | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryNameById, setCategoryNameById] = useState<Map<string, string>>(
    new Map(),
  );
  const [chartsReady, setChartsReady] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const inv = await getActiveInventory();
        setActive(inv);
      } catch {
        setActive(null);
      }
    };

    run();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [loadedItems, categories] = await Promise.all([
          listInventoryItems(),
          listActiveCategories(),
        ]);
        setItems(loadedItems);
        setCategoryNameById(
          new Map(categories.map((category) => [category.id, category.name])),
        );
        setChartsReady(true);
      } catch {
        setItems([]);
        setCategoryNameById(new Map());
        setChartsReady(false);
      }
    };

    loadDashboardData();
  }, []);

  const lowStockCount = useMemo(() => items.filter(isLowStock).length, [items]);
  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.stock, 0),
    [items],
  );
  const totalItemCount = items.length;
  const totalUnits = useMemo(
    () => items.reduce((sum, item) => sum + item.stock, 0),
    [items],
  );
  const itemsWithoutCategory = useMemo(
    () =>
      items.filter(
        (item) => !item.category_names?.length && !item.category_ids?.length,
      ).length,
    [items],
  );
  const itemsWithoutThreshold = useMemo(
    () => items.filter((item) => item.low_stock_threshold == null).length,
    [items],
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Inventory Dashboard
              </Typography>
            </Box>

            {active && active.role === "owner" && (
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  component={Link}
                  to={PATHS.INVENTORY_MEMBERS}
                >
                  Manage Members
                </Button>

                <Button
                  variant="outlined"
                  component={Link}
                  to={PATHS.INVITE_EMPLOYEE}
                >
                  + Invite Employee
                </Button>
              </Stack>
            )}
          </Stack>

          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={2.5}
            alignItems="stretch"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LowStockWarningsCard />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <DashboardSummaryCard
                lowStockCount={lowStockCount}
                totalValue={totalValue}
                totalItemCount={totalItemCount}
                totalUnits={totalUnits}
                itemsWithoutCategory={itemsWithoutCategory}
                itemsWithoutThreshold={itemsWithoutThreshold}
              />
            </Box>
          </Stack>

          <Box sx={{ mb: 3 }}>
            {chartsReady ? (
              <DashboardChartsCard
                items={items}
                categoryNameById={categoryNameById}
              />
            ) : (
              <Alert severity="info">Not enough data to show charts.</Alert>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
