import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { PATHS } from "../App";
import { checkSession } from "./authService";

const AuthGuardLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await checkSession();

        // Redirect if failed
        if (!session) {
          navigate(PATHS.LOGIN);
        }
      } catch {
        navigate(PATHS.LOGIN);
      }
    };

    verifySession();
  }, [navigate]);

  return <Outlet />;
};

export default AuthGuardLayout;
