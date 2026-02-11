import "./login.css";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        navigate("/login");
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
      <div className="login-form">
        <h2>Welcome!</h2>
        <div style={{ color: "green", margin: "20px 0" }}>
          <h3>Account created successfully.</h3>
          <p>Redirecting to login...</p>
        </div>
        <button onClick={() => navigate("/login")} className="submit-button">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="login-form">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Name Input */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Full Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {/* Email Input */}
        <div className="input-group">
          <input
            type="email"
            placeholder="info@inventoryx.no"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {/* Password Input */}
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {/* Confirm Password Input */}
        <div className="input-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <div style={{ marginTop: "1rem" }}>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            Already have an account?{" "}
          </span>
          <button
            onClick={() => navigate("/login")}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
};

export default Registration;
