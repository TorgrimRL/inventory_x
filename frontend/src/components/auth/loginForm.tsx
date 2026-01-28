import "./login.css";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkSession } from "../../services/authService.ts";

const Login: React.FC = () => {
  // init app state.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // Valite session, skip the login.
  useEffect(() => {
    const verifyUser = async () => {
      const isValid = await checkSession();

      if (isValid) {
        navigate("/dashboard"); // Redirect if logged in
      } else {
        setCheckingAuth(false); // show form
      }
    };

    verifyUser();
  }, [navigate]);

  // show loading, while waiting for checkSession to complete.
  if (checkingAuth) {
    return <p className="text-gray-600 font-medium">Verifying session...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if email is missing '@' OR missing '.'
    if (!email.includes("@") || !email.includes(".")) {
      setError("Invalid email: Must contain '@' and '.'");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    try {
      await axios.post(
        "/api/user/login/",
        { email, password },
        {
          withCredentials: true,
        },
      );

      // console.log("Response Headers:", res.headers);
      // console.log("Response Data:", res.data);
      // console.log("Cookies visible to JS:", document.cookie);
      navigate("/dashboard");
    } catch (err: any) {
      const data = err.response?.data;
      let message = "Login failed. Please check your credentials.";

      // Disply frontend error invalid email input if its exists else show the error msg from server.
      if (data?.email) {
        message = Array.isArray(data.email) ? data.email[0] : data.email;
      }
      else if (data?.detail) {
        message = data.detail;
      }

      if (typeof message === 'object') {
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
