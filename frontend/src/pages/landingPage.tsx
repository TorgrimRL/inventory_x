import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "#0f0f0f",
        position: "absolute",
        top: 0,
        left:0,
        right: 0,
      }}
    >
      {/* HERO */}
      <Container maxWidth="md">
        <Box textAlign="center" sx={{ pt: 16, pb: 12 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              background: "linear-gradient(90deg, #C4A588, #895B40, #EDCDB4)",
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
            sx={{ color: "#C4A588", opacity: 0.85, mb: 4 }}
          >
            Precision. Control. Elegance.
          </Typography>

          <Stack direction="row" spacing={3} justifyContent="center">
            <Button
              variant="contained"
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(90deg, #82543A, #C4A588)",
                color: "#0f0f0f",
                fontWeight: 600,
                boxShadow: "0 8px 20px rgba(137,91,64,0.4)",
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
                borderColor: "#C4A588",
                color: "#C4A588",
                "&:hover": {
                  backgroundColor: "rgba(196,165,136,0.1)",
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
                background: "rgba(25,25,25,0.9)",
                border: "1px solid #82543A",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": {
                  borderColor: "#C4A588",
                  boxShadow: "0 10px 30px rgba(137,91,64,0.3)",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    background: "linear-gradient(90deg, #C4A588, #EDCDB4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography sx={{ color: "#C4A588", opacity: 0.8 }}>
                  {item.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      {/* CTA */}
      <Box textAlign="center" sx={{ pb: 16 }}>
        <Typography variant="h5" sx={{ color: "#C4A588", mb: 3 }}>
          Refine Your Inventory Experience
        </Typography>

        <Button
          variant="contained"
          sx={{
            px: 6,
            py: 1.8,
            borderRadius: 2,
            background: "linear-gradient(90deg, #895B40, #EDCDB4)",
            color: "#0f0f0f",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(137,91,64,0.4)",
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
