import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import apiClient from "../../services/apiClient";
import { checkSession } from "../../services/authService";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const valid = await checkSession();
        setIsValid(valid);
      } catch {
        setIsValid(false);
      } finally {
        setChecked(true);
      }
    };
    verify();
  }, []);
  useEffect(() => {
    if (checked && !isValid) {
      navigate(PATHS.LOGIN, { replace: true });
    }
  }, [checked, isValid, navigate]);

  const logoutHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await apiClient.post("/api/user/logout/");
    if (res.status == 200) {
      localStorage.clear(); // clear session storage.
      navigate(PATHS.LOGIN);
    }
  };

  if (!checked || !isValid) return null;

  return (
    <button onClick={logoutHandler} type="button" className="submit-button">
      {" "}
      logout
    </button>
  );
};

export default LogoutButton;
