import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Package, PieChart, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App.tsx";

const topoBg = "/topography-2000x600.svg";

const FEATURES = [
  {
    icon: Package,
    title: "Real-Time Inventory",
    description:
      "Maintain complete oversight with instant stock updates directly from your dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Low-Stock Intelligence",
    description:
      "Anticipate shortages before they affect your operations with automated low-stock alerts.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Control permissions with structured team management and granular access roles.",
  },
  {
    icon: PieChart,
    title: "Insightful Metrics",
    description:
      "Make informed decisions with elegant, easy-to-read data visualization metrics.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme() as any;

  const primaryButtonSx = {
    px: { xs: 4, md: 5 },
    py: 1.5,
    borderRadius: 2,
    fontWeight: 600,
    background: theme.gradients?.button || theme.palette.primary.main,
    color: "background.default",
    boxShadow: `0px 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        flexGrow: 1,
      }}
    >
      {/* HERO SECTION */}
      <Container
        maxWidth="md"
        sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}
      >
        <Typography
          variant="h2"
          component="h1"
          fontWeight={700}
          sx={{
            background: theme.gradients?.text || theme.palette.primary.main,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
          }}
        >
          INVENTORY X
        </Typography>

        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
        >
          Track items and manage stock for your business seamlessly with our
          centralized platform.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            sx={primaryButtonSx}
            onClick={() => navigate(PATHS.REGISTRATION)}
          >
            Get Started
          </Button>

          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 5,
              borderRadius: 2,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                borderColor: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
            onClick={() => navigate(PATHS.LOGIN)}
          >
            Log In
          </Button>
        </Stack>
      </Container>

      {/* FEATURES SECTION */}
      <Box
        sx={{
          position: "relative",
          borderTop: 1,
          borderBottom: 1,
          borderColor: "divider",
          py: { xs: 6, md: 10 },
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${topoBg}")`,
            backgroundPosition: "center",
            opacity: 0.15,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4}>
            {FEATURES.map((feat, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    border: 1,
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: theme.transitions.create([
                      "border-color",
                      "transform",
                      "box-shadow",
                    ]),
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: theme.shadows[6],
                      transform: "translateY(-4px)",
                      "& .icon-wrapper": { transform: "scale(1.1)" },
                    },
                  }}
                >
                  <Box
                    className="icon-wrapper"
                    sx={{
                      color: "primary.main",
                      mb: 2,
                      transition: theme.transitions.create("transform"),
                    }}
                  >
                    <feat.icon size={40} strokeWidth={1.5} />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ color: "text.primary", fontWeight: 600, mb: 1.5 }}
                  >
                    {feat.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feat.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FOOTER SECTION */}
      <Box
        sx={{
          pt: 4,
          pb: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Button
          variant="contained"
          sx={{ ...primaryButtonSx, my: "auto" }}
          onClick={() => navigate(PATHS.REGISTRATION)}
        >
          CREATE ACCOUNT
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Copyright © 2026. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
