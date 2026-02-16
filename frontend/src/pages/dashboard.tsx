import { Alert, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

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

      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
        Inventory Dashboard
      </Typography>

      <Typography sx={{ mb: 3 }}>
        If you see this, your login redirect worked!
      </Typography>

      <LogoutButton />
    </Box>
  );
};

export default Dashboard;
