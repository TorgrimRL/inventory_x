import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PATHS } from "../App";
import LogoutButton from "../components/auth/logoutButton";
import {
  type ActiveInventory,
  getActiveInventory,
} from "../services/inventoryService";
import LowStockWarningsCard from "../components/inventory/LowStockWarningsCard.tsx";

const Dashboard = () => {
  const [active, setActive] = useState<ActiveInventory | null>(null);

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
          <Box sx={{ mb: 3, maxWidth: 720, ml: { md: 2 } }}>
            <LowStockWarningsCard />
          </Box>

          <Box>
            <LogoutButton />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
