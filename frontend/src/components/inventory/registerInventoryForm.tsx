import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import axios from "../../services/apiClient";

type BackendDetail =
  | string
  | {
      name?: string[];
      orgNumber?: string[];
    };

function extractBackendMessages(detail: BackendDetail | undefined): string[] {
  if (!detail) return [];
  if (typeof detail === "string") return [detail];

  const msgs: string[] = [];
  if (Array.isArray(detail.name)) msgs.push(...detail.name);
  if (Array.isArray(detail.orgNumber)) msgs.push(...detail.orgNumber);
  return msgs;
}

export default function RegisterInventoryForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);
  const [frontendErrors, setFrontendErrors] = useState<string[]>([]);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  const allErrors = useMemo(
    () => [...frontendErrors, ...backendErrors],
    [frontendErrors, backendErrors],
  );

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Please enter business name");
    if (!orgNumber.trim()) errs.push("Please enter org number");
    return errs;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess(null);
    setBackendErrors([]);

    const errs = validate();
    setFrontendErrors(errs);
    if (errs.length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), orgNumber: orgNumber.trim() };
      const res = await axios.post("/api/inventory/register/", payload);

      if (res.status === 201) {
        setFrontendErrors([]);
        setBackendErrors([]);
        setSuccess("Business registered");
        setTimeout(() => navigate(PATHS.INVENTORIES), 1500);
      } else {
        setBackendErrors(["Unexpected response from server."]);
      }
    } catch (err: any) {
      const status: number | undefined = err?.response?.status;
      const detail: BackendDetail | undefined = err?.response?.data?.detail;

      const msgs = extractBackendMessages(detail);
      if (msgs.length === 0) {
        if (status === 401)
          msgs.push("Authentication credentials were not provided.");
        else if (status === 403) msgs.push("Forbidden.");
        else msgs.push("Something went wrong. Please try again.");
      }
      setBackendErrors(msgs);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 3, sm: 3, md: 8 },
          py: { xs: 3, md: 3 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 4, md: 8 },
          alignItems: "center",
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
              minHeight: { md: 560 },
              px: { xs: 1, sm: 4 },
              py: { xs: 4, sm: 6 },
            }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ letterSpacing: -0.5 }}
            >
              Register
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              Manage all your inventory efficiently
            </Typography>

            <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: { xs: 3, sm: 4, md: 5 },
              }}
            >
              {allErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Stack spacing={0.5}>
                    {allErrors.map((m, i) => (
                      <div key={`${m}-${i}`}>{m}</div>
                    ))}
                  </Stack>
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label="Business name"
                    placeholder="Business name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    fullWidth
                  />

                  <TextField
                    label="Org Number"
                    placeholder="Org Number"
                    value={orgNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOrgNumber(e.target.value)
                    }
                    fullWidth
                    slotProps={{
                      htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* RIGHT (illustration) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "flex-start",
            pl: { md: 4, lg: 6 },
            transform: { md: "translateY(-20px)", lg: "translateY(-40px)" },
          }}
          aria-hidden="true"
        >
          <Box
            component="img"
            src="/register-inventory-illustration.svg"
            alt=""
            sx={{
              width: "100%",
              maxWidth: 420,
              height: "auto",
              objectFit: "contain",
              opacity: (theme) => (theme.palette.mode === "dark" ? 0.75 : 1),
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
