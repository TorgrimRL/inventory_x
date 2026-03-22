import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PATHS } from "../App.tsx";
import {
  getActiveInventory,
  type Inventory,
  listInventories,
  setActiveInventory,
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
  const location = useLocation() as any;
  const needChoice = Boolean(location?.state?.needChoice);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const onSelect = async (id: string) => {
    setSelectingId(id);
    setError(null);

    try {
      const active = await setActiveInventory(id);
      setActiveId(active.id);
      navigate(PATHS.DASHBOARD);
    } catch (err: any) {
      const status: number | undefined = err?.response?.status;
      setError(
        status === 403
          ? "You are not a member of this inventory."
          : "Failed to set active inventory. Please try again.",
      );
    } finally {
      setSelectingId(null);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      try {
        const data = await listInventories();
        setInventories(data);

        const active = await getActiveInventory(); // 200 => object, 204 => null
        setActiveId(active?.id ?? null);
      } catch (err: any) {
        const status: number | undefined = err?.response?.status;
        const msg = getAuthMessage(status);
        setActiveId(null);
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            px: { xs: 3, sm: 6 },
            py: { xs: 6, sm: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
              p: 4,
              maxWidth: "100%",
              borderRadius: 1,
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
                  "& .MuiAlert-message": { width: "100%" },
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

            {/* NEED CHOICE (redirected from dashboard) */}
            {!loading && !isUnauthorized && needChoice && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please choose an inventory to continue.
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm:
                      inventories.length === 1
                        ? "1fr"
                        : "repeat(2, minmax(0, 400px))",
                  },
                  justifyContent: "center",
                  justifyItems: "center",
                  columnGap: 3,
                  rowGap: 2,
                  mb: 5,
                }}
              >
                {inventories.map((inv) => {
                  const isSelecting = selectingId === inv.id;
                  const isActive = activeId === inv.id;

                  return (
                    <Paper
                      key={inv.id ?? `${inv.name}-${inv.orgNumber}`}
                      variant="outlined"
                      sx={{
                        width: "100%",
                        maxWidth: 400,
                        borderRadius: 1,
                        overflow: "hidden",
                        height: "100%",
                        transition:
                          "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
                        borderColor: (theme) =>
                          isActive
                            ? alpha(theme.palette.success.main, 0.3)
                            : isSelecting
                              ? theme.palette.secondary.main
                              : theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.12)"
                                : theme.palette.divider,
                        bgcolor: (theme) =>
                          isActive
                            ? alpha(theme.palette.success.main, 0.04)
                            : "transparent",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                              ? theme.shadows[9]
                              : theme.shadows[3],
                          borderColor: (theme) =>
                            isActive
                              ? theme.palette.success.main
                              : theme.palette.primary.main,
                        },
                      }}
                    >
                      <ButtonBase
                        onClick={() =>
                          isActive
                            ? navigate(PATHS.DASHBOARD)
                            : onSelect(inv.id)
                        }
                        disabled={isSelecting}
                        sx={{
                          width: "100%",
                          height: "100%",
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          textAlign: "center",
                          cursor: isSelecting ? "default" : "pointer",
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          {/* Active chip */}
                          <Box
                            sx={{
                              height: 24,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isActive && (
                              <Chip
                                label="Active"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 800 }}
                              />
                            )}
                          </Box>

                          <Typography fontWeight={800}>{inv.name}</Typography>

                          <Typography sx={{ color: "text.secondary" }}>
                            Org number: {inv.orgNumber}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1,
                              height: 20,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {isSelecting && (
                              <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "text.secondary",
                                  }}
                                >
                                  Selecting…
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Stack>
                      </ButtonBase>
                    </Paper>
                  );
                })}
              </Box>
            )}

            {/* CTA buttons (vis alltid når ikke loading, og ikke unauthorized) */}
            {!loading && !isUnauthorized && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                  mt: 3,
                }}
              >
                {/* Placement of "Register new" button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: {
                      xs: "center",
                      sm: "flex-end",
                    },
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(PATHS.INVENTORIES_NEW)}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "fit-content",
                      },
                      px: { xs: 2, sm: 4 },
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    Register new
                  </Button>
                </Box>

                {/* Placement of "To dashboard" button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: {
                      xs: "center",
                      sm: "flex-start",
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(PATHS.DASHBOARD)}
                    disabled={!activeId}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "fit-content",
                      },
                      px: { xs: 2, sm: 4 },
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    To dashboard
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
