import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App.tsx";
import {
  type Inventory,
  listInventories,
} from "../services/inventoryService.ts";

function getAuthMessage(status?: number): string {
  if (status === 401) return "Authentication credentials were not provided.";
  if (status === 403) return "Forbidden.";
  return "Something went wrong. Please try again.";
}

export default function InventoriesPage() {
  const navigate = useNavigate();

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      try {
        const data = await listInventories();
        setInventories(data);
      } catch (err: any) {
        const status: number | undefined = err?.response?.status;
        const msg = getAuthMessage(status);

        setError(msg);
        if (status === 401 || status === 403) setIsUnauthorized(true);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const showEmpty = !loading && !isUnauthorized && inventories.length === 0;
  const showList = !loading && !isUnauthorized && inventories.length > 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", display: "flex" }}>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "520px 1fr" },
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            px: { xs: 3, sm: 6 },
            py: { xs: 6, sm: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* little brand mark */}
          <Box
            sx={{
              width: 14,
              height: 14,
              bgcolor: "#7cfff0",
              borderRadius: 1,
              mb: 2,
            }}
          />

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ letterSpacing: -0.5 }}
          >
            Inventories
          </Typography>

          <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 460 }}>
            Overview of your registered inventories/businesses.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 0,
              maxWidth: 460,
            }}
          >
            {/* LOADING */}
            {loading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Loading inventories...
              </Alert>
            )}

            {/* ERROR (incl unauthorized) */}
            {!loading && error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  "& .MuiAlert-message": { width: "100%" }, // viktig!
                }}
              >
                <Stack spacing={1} sx={{ width: "100%" }} alignItems="center">
                  <Typography>{error}</Typography>

                  {isUnauthorized && (
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      justifyContent="center"
                    >
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(PATHS.HOME)}
                        sx={{ textTransform: "none", fontWeight: 800 }}
                      >
                        Go to login
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(-1)}
                        sx={{ textTransform: "none", fontWeight: 800 }}
                      >
                        Go back
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Alert>
            )}

            {/* EMPTY */}
            {showEmpty && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No inventories to show yet. Create one to get started.
              </Alert>
            )}

            {/* LIST */}
            {showList && (
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {inventories.map((inv) => (
                  <Paper
                    key={inv.id ?? `${inv.name}-${inv.orgNumber}`}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3 }}
                  >
                    <Typography fontWeight={800}>{inv.name}</Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      Org number: {inv.orgNumber}
                    </Typography>

                    {/* Hvis du vil: knapp for “velg aktiv” senere */}
                    {/* <Button size="small" onClick={() => setActive(inv.id)}>Select</Button> */}
                  </Paper>
                ))}
              </Stack>
            )}

            {/* CTA buttons (vis alltid når ikke loading, og ikke unauthorized) */}
            {!loading && !isUnauthorized && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mt: 1 }}
                flexWrap="wrap"
                justifyContent={"center"}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(PATHS.INVENTORIES_NEW)}
                  sx={{
                    height: 54,
                    borderRadius: 3,
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 14px 30px rgba(11, 20, 55, 0.22)",
                  }}
                >
                  Register new
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(PATHS.DASHBOARD)}
                  sx={{
                    height: 54,
                    borderRadius: 3,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  Back to dashboard
                </Button>
              </Stack>
            )}
          </Paper>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            bgcolor: "#fff",
          }}
          aria-hidden="true"
        >
          <Box
            component="img"
            src="/auth-illustration.png"
            alt=""
            sx={{
              width: "min(920px, 92%)",
              height: "auto",
              objectFit: "contain",
              opacity: 0.95,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
