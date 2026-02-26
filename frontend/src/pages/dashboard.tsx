import { Alert, Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PATHS } from "../App";
import LogoutButton from "../components/auth/logoutButton";
import {
  type ActiveInventory,
  getActiveInventory,
} from "../services/inventoryService";

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
    <Box sx={{ p: 4 }}>
      {active && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Active inventory: <strong>{active.name}</strong> ({active.orgNumber})
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={800}>
          Inventory Dashboard
        </Typography>

        {active && active.role.toUpperCase() === "OWNER" && (
          <Button
            variant="contained"
            component={Link}
            to={PATHS.INVITE_EMPLOYEE}
          >
            + Invite Employee
          </Button>
        )}
      </Box>

      <Typography sx={{ mb: 3 }}>
        If you see this, your login redirect worked!
      </Typography>

      <LogoutButton />
    </Box>
  );
};

export default Dashboard;
