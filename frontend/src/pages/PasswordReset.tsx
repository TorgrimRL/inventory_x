import { type CSSProperties, type FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PATHS } from "../App";
import apiClient from "../services/apiClient";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extracts ?token=... from URL
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
    } catch {
      setError("Link expired or invalid. Please request a new reset link.");
    } finally {
      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2000);
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setError("Link expired or invalid. Redirecting...");
        setTimeout(() => {
          navigate(PATHS.PASSWORD_FORGOT);
        }, 5000);
      }
    };

    verifyUser();
  }, [navigate, token]);

  return (
    <div style={styles.container}>
      <div
        style={{ ...styles.card, textAlign: styles.card.textAlign as "center" }}
      >
        <h2>Set New Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading || !password}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box", // Now TS knows this is a valid BoxSizing value
  },

  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  card: {
    padding: "2rem",
    borderRadius: "8px",
    width: "320px",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  success: {
    color: "green",
    marginTop: "10px",
  },
};
