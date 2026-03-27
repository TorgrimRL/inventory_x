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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../App";
import apiClient from "../services/apiClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post(`/api/user/password_reset?email=${email}`);
      setTimeout(() => {
        setLoading(false);
        setMessage("If this email exists, a reset link has been sent.");
      }, 2159);
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setTimeout(() => {
        navigate(PATHS.HOME);
      }, 7000);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={1} sx={{ p: 4, mt: 6 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5">Forgot Password</Typography>

          <Box component="form" onSubmit={handleSubmit} width="100%">
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
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
