import "./login.css";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../../services/apiClient";
import { checkSession } from "../../services/authService.ts";
import { PATHS } from "../../App.tsx";

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
        navigate(PATHS.INVENTORY.LIST); // Redirect if logged in
      } else {
        setCheckingAuth(false); // show form
      }
    };

    verifyUser();
  }, [navigate]);

  // show loading while waiting for checkSession to complete.
  if (checkingAuth) {
    return <p className="text-gray-600 font-medium">Verifying session...</p>;
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

      navigate(PATHS.INVENTORY.LIST);
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
    <div className="login-form">
      <h2>login</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* inputs */}
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
        {error && <p className="error-message">{error}</p>}

        {/* buttons*/}
        <button type="submit" className="submit-button">
          Login
        </button>
        <button
          onClick={() => navigate("/registration")}
          type="button"
          className="submit-button"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Login;
