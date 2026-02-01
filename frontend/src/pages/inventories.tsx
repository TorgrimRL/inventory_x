import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function InventoriesPage() {
  const navigate = useNavigate();

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
            {/* Placeholder for list */}
            <Alert severity="info" sx={{ mb: 2 }}>
              No inventories to show yet. Create one to get started.
            </Alert>

            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }} flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/inventories/new")}
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
                onClick={() => navigate("/dashboard")}
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
