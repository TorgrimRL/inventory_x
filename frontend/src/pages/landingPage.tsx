import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* HERO */}
      <Container maxWidth="md">
        <Box textAlign="center" sx={{ pt: 16, pb: 12 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              background: theme.gradients.text,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 2,
            }}
            gutterBottom
          >
            INVENTORY X
          </Typography>

          <Typography
            variant="h6"
            color="text.primary"
            sx={{ opacity: 0.85, mb: 4 }}
          >
            Track items and manage stock for your business
          </Typography>

          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              variant="contained"
              sx={{
                px: 5,
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
              sx={{
                px: 5,
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
        </Box>
      </Container>

      {/* FEATURES */}
      <Container maxWidth="sm">
        <Stack spacing={4} sx={{ pb: 14 }}>
          {[
            {
              title: "Real-Time Inventory",
              text: "Maintain complete oversight with instant stock updates.",
            },
            {
              title: "Low-Stock Intelligence",
              text: "Anticipate shortages before they affect your operations.",
            },
            {
              title: "Role-Based Access",
              text: "Control permissions with structured team management.",
            },
            {
              title: "Insightful Metrics",
              text: "Make informed decisions with elegant data visualization.",
            },
          ].map((item) => (
            <Card
              key={item.title}
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: `0 10px 30px ${theme.palette.primary.main}33`,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {item.title}
                </Typography>

                <Typography color="text.secondary" sx={{ opacity: 0.9 }}>
                  {item.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      {/* CTA */}
      <Box textAlign="center" sx={{ pb: 16 }}>
        <Typography variant="h5" color="primary.main" sx={{ mb: 3 }}>
          Refine Your Inventory Experience
        </Typography>

        <Button
          variant="contained"
          sx={{
            px: 6,
            py: 1.8,
            borderRadius: 2,
            fontWeight: 600,
            background: theme.gradients.button,
            color: theme.palette.background.default,
            boxShadow: `0 10px 30px ${theme.palette.primary.main}55`,
          }}
          onClick={() => navigate(PATHS.REGISTRATION)}
        >
          Create Account
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
