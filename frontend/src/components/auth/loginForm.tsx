import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import axios from "../../services/apiClient";
import { checkSession, startSocialLogin } from "../../services/authService";

const Login: React.FC = () => {
  // init app state.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // Validate session, skip the login.
  useEffect(() => {
    const verifyUser = async () => {
      const isValid = await checkSession();

      if (isValid) {
        navigate(PATHS.INVENTORIES); // Redirect if logged in
      } else {
        setCheckingAuth(false); // show form
      }
    };

    verifyUser();
  }, [navigate]);

  // show loading while waiting for checkSession to complete.
  if (checkingAuth) {
    return (
      <Container maxWidth="sm">
        <Typography variant="body1">Verifying session...</Typography>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if the email is missing '@' OR missing '.'
    if (!email.includes("@") || !email.includes(".")) {
      setError("Invalid email: Must contain '@' and '.'");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    try {
      await axios.post("/api/user/login/", { email, password });

      navigate(PATHS.INVENTORIES);
    } catch (err: any) {
      const data = err.response?.data;
      let message = "Login failed. Please check your credentials.";

      // Unwrap server side error msg.
      if (data.detail.email) {
        message = data.detail.email;
      } else if (data.detail.password) {
        message = data.detail.password;
      } else {
        message = data.detail;
      }

      if (typeof message === "object") {
        message = JSON.stringify(message);
      }

      setError(message);
      return;
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" mb={3}>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              placeholder="info@inventoryx.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button type="submit" variant="contained">
                Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => startSocialLogin("google")}
              >
                Continue with Google
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(PATHS.REGISTRATION)}
              >
                Create Account
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
