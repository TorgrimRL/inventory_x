import "./topbar.css";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import { checkSession } from "../../services/authService";
import LogoutButton from "../auth/logoutButton";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidSession, setIsValidSession] = useState(false);

  const authNavItems = [
    ["Storage", PATHS.INVENTORIES],
    ["Dashboard", PATHS.DASHBOARD],
  ];

  const publicNavItems = [
    ["Login", PATHS.LOGIN],
    ["Registration", PATHS.REGISTRATION],
    ["Forgot password", PATHS.PASSWORD_FORGOT],
  ];

  useEffect(() => {
    async function verify() {
      try {
        const session = await checkSession();
        setIsValidSession(session);
      } catch {
        setIsValidSession(false);
      }
    }

    verify();
  }, [location, navigate]);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to={PATHS.HOME} className="logo-link">
          <h2>Inventory x</h2>
        </Link>
      </div>

      <div className="nav-buttons">
        {isValidSession ? (
          /* For logged-in users */
          <>
            {authNavItems.map(([name, path]) => (
              <button
                key={path}
                className="submit-button"
                onClick={() => navigate(path)}
              >
                {name}
              </button>
            ))}
            <LogoutButton />
          </>
        ) : (
          /* For logged-out users */
          <>
            {publicNavItems.map(
              ([label, path]) =>
                location.pathname !== path && (
                  <button
                    key={path}
                    className="submit-button"
                    onClick={() => navigate(path)}
                  >
                    {label}
                  </button>
                ),
            )}
          </>
        )}
      </div>
    </nav>
  );
}
