import { Alert, Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import { getActiveInventory } from "../../services/inventoryService";

export default function RequireActiveInventory({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = useNavigate();
  const loc = useLocation();
  const [loading, setLoading] = useState(true);

  const didRedirect = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const safeNav = (to: string, opts?: any) => {
      if (didRedirect.current) return;
      didRedirect.current = true;
      setTimeout(() => nav(to, opts), 0);
    };

    const run = async () => {
      try {
        let active = await getActiveInventory();

        if (!active) {
          await sleep(120);
          active = await getActiveInventory();
        }

        if (cancelled) return;

        if (!active) {
          safeNav(PATHS.INVENTORIES, {
            replace: true,
            state: { needChoice: true, from: loc.pathname },
          });
          return;
        }
      } catch (err: any) {
        if (cancelled) return;

        const status: number | undefined = err?.response?.status;
        if (status === 401 || status === 403) {
          safeNav(PATHS.HOME, { replace: true });
          return;
        }

        safeNav(PATHS.INVENTORIES, {
          replace: true,
          state: { needChoice: true, from: loc.pathname },
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [nav, loc.pathname]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Checking active inventory…</Alert>
      </Box>
    );
  }

  return <>{children}</>;
}
