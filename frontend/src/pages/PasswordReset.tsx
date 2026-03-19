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
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PATHS } from "../App";
import apiClient from "../services/apiClient";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await apiClient.put("/api/user/password_reset", {
        OTC: token,
        NEW_PASSWORD: password,
      });

      setMessage("Password successfully updated! Redirecting to login...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2000);
    } catch {
      setError("Link expired or invalid. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!token) {
      setError("Link expired or invalid. Redirecting...");
      timeoutId = setTimeout(() => {
        navigate(PATHS.PASSWORD_FORGOT);
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [navigate, token]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={1} sx={{ p: 4, mt: 6 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5">Set New Password</Typography>

          <Box component="form" onSubmit={handleSubmit} width="100%" noValidate>
            <Stack spacing={2}>
              <TextField
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                fullWidth
                required
              />

              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !password || !token}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </Stack>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
        </Stack>
      </Paper>
    </Container>
  );
}
