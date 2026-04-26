import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App.tsx";

const topoBg = "/topography-2000x600.svg";

const FEATURES = [
  {
    icon: Inventory2OutlinedIcon,
    title: "Real-Time Inventory",
    description:
      "Maintain complete oversight with instant stock updates directly from your dashboard.",
  },
  {
    icon: TrendingUpIcon,
    title: "Low-Stock Intelligence",
    description:
      "Anticipate shortages before they affect your operations with automated low-stock alerts.",
  },
  {
    icon: PeopleOutlineIcon,
    title: "Role-Based Access",
    description:
      "Control permissions with structured team management and granular access roles.",
  },
  {
    icon: PieChartOutlineIcon,
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
            fontSize: { xs: "2.5rem", sm: "3.75rem" },
            letterSpacing: { xs: 1, sm: 2 },
            whiteSpace: "nowrap",
            background: theme.gradients.text,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
          alignItems="center"
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              minWidth: 170,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              background: theme.gradients.button,
              color: "background.default",
              boxShadow: `0 8px 20px ${theme.palette.primary.main}55`,
            }}
            onClick={() => navigate(PATHS.REGISTRATION)}
          >
            Get Started
          </Button>

          <Button
            variant="outlined"
            size="large"
            sx={{
              minWidth: 170,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                backgroundColor: `${theme.palette.primary.main}15`,
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
                    <feat.icon sx={{ fontSize: 40 }} />
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
          size="large"
          variant="contained"
          sx={{ ...primaryButtonSx, my: "auto" }}
          onClick={() => navigate(PATHS.REGISTRATION)}
        >
          CREATE ACCOUNT
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Copyright © 2026. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate(PATHS.POLICY)}
            sx={{ textTransform: "none", fontSize: "0.875rem" }}
          >
            Privacy Policy
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
