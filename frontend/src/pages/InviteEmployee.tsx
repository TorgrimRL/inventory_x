import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { inviteUser } from "../services/inventoryService";

const InviteEmployee = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await inviteUser(email);
      setMessage({
        type: "success",
        text: `Successfully invited ${email} to the inventory.`,
      });
      setEmail("");
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorText = "An error occurred while inviting the user.";

      if (errorData?.detail) {
        if (typeof errorData.detail === "string") {
          errorText = errorData.detail;
        } else if (errorData.detail.non_field_errors) {
          errorText = errorData.detail.non_field_errors[0];
        } else {
          errorText = JSON.stringify(errorData.detail);
        }
      }

      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        Invite Employee
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleInvite}>
        <TextField
          label="Employee Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !email}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : "Invite / Add employee"}
        </Button>
      </form>
    </Box>
  );
};

export default InviteEmployee;
