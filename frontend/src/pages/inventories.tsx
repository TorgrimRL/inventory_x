import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 5 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "400px minmax(0, 1fr)" },
          gap: { xs: 4, md: 8 },
          alignItems: "stretch",
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              px: { xs: 1, sm: 2 },
              py: { xs: 4, sm: 6 },
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
                <Stack spacing={1.5} sx={{ mb: 2, maxWidth: 380 }}>
                  {inventories.map((inv) => {
                    const isSelecting = selectingId === inv.id;
                    const isActive = activeId === inv.id;

                    return (
                      <Paper
                        key={inv.id ?? `${inv.name}-${inv.orgNumber}`}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          transition:
                            "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
                          borderColor: isActive
                            ? "rgba(46, 125, 50, 0.55)" // "success-ish" uten å hardcode farger er vanskelig, men dette er mildt
                            : isSelecting
                              ? "rgba(11, 20, 55, 0.28)"
                              : "rgba(11, 20, 55, 0.18)",
                          bgcolor: isActive
                            ? "rgba(46, 125, 50, 0.06)"
                            : "transparent",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 10px 24px rgba(11, 20, 55, 0.10)",
                            borderColor: isActive
                              ? "rgba(46, 125, 50, 0.75)"
                              : "rgba(11, 20, 55, 0.35)",
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
                            p: 2,
                            display: "block",
                            textAlign: "center",
                            cursor: isSelecting ? "default" : "pointer",
                          }}
                        >
                          <Stack spacing={0.5} alignItems="center">
                            {/* Active chip */}
                            {isActive && (
                              <Chip
                                label="Active"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 800 }}
                              />
                            )}

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
                    disabled={!activeId}
                    sx={{
                      height: 54,
                      borderRadius: 3,
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    To dashboard
                  </Button>
                </Stack>
              )}
            </Paper>
          </Box>
        </Box>
        {/* RIGHT */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            height: 560,
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
              width: "100%",
              maxWidth: 760,
              maxHeight: "100%",
              height: "auto",
              objectFit: "contain",
              opacity: 0.95,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>{" "}
      </Box>
    </Box>
  );
}
