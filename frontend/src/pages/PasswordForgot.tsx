import React, { useState } from "react";
import apiClient from "../services/apiClient";
import { PATHS } from "../App";
import { useNavigate } from "react-router-dom";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSubmit = async (e) => {
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

    } catch (err) {
      setError("Something went wrong. Please try again later.");

    } finally {
      setTimeout(() => {
        navigate(PATHS.HOME);
      }, 7000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
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
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
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
