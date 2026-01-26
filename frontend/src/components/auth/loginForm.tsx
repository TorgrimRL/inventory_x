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

    try {
      const res = await axios.post(
        "/api/user/login/",
        { email, password },
        {
          withCredentials: true,
        },
      );

      console.log("Response Headers:", res.headers);
      console.log("Response Data:", res.data);
      console.log("Cookies visible to JS:", document.cookie);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <div className="login-form">
      <h2>login</h2>
      <form onSubmit={handleSubmit}>
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
