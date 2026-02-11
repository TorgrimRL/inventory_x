import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkSession } from "../../services/authService";
import { PATHS } from "../../App";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const [isValid, setlsValid] = useState<boolean>(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const valid = await checkSession();
        setlsValid(valid);
      } catch {
        setlsValid(false);
      }
    };
    verify();
  }, []);

  const logoutHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await axios.post("/api/user/logout/", {
      withCredentials: true,
    });
    if (res.status == 200) {
      localStorage.clear(); // clear session storage.
      navigate(PATHS.LOGIN);
    }
  };

  // Logout button render only for authorized users.
  if (!isValid) {
    navigate(PATHS.LOGIN);
  }

  return (
    <button onClick={logoutHandler} type="button" className="submit-button">
      {" "}
      logout
    </button>
  );
};

export default LogoutButton;
