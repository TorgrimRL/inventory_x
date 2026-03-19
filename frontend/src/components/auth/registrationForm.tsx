import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import axios from "../../services/apiClient";

const Registration: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.includes("@") || !email.includes(".")) {
      setError("Invalid email address.");
      return;
    }

    if (password == "") {
      setError("Password: Cannot be empty");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password: Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/user/signup/", {
        email,
        password,
        display_name: name,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2000);
    } catch (err: any) {
      const data = err.response?.data;
      let message = "Registration failed. Please try again.";

      if (data?.detail) {
        if (Array.isArray(data.detail.email)) {
          message = `Email: ${data.detail.email[0]}`;
        } else if (Array.isArray(data.detail.password)) {
          message = `Password: ${data.detail.password[0]}`;
        } else if (Array.isArray(data.detail.display_name)) {
          message = `Name: ${data.detail.display_name[0]}`;
        } else if (typeof data.detail === "string") {
          message = data.detail;
        } else {
          message = JSON.stringify(data.detail);
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ mt: 8, p: 4 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5">Welcome!</Typography>

            <Alert severity="success">
              Account created successfully. Redirecting to login...
            </Alert>

            <Button variant="contained" onClick={() => navigate(PATHS.LOGIN)}>
              Go to Login
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" mb={3}>
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Full Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

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

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate(PATHS.LOGIN)}
              >
                Login here
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Registration;
