import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import apiClient from "../../services/apiClient";

export default function LogoutButton() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      const res = await apiClient.post("/api/user/logout/");

      if (res.status === 200) {
        localStorage.clear();
        navigate(PATHS.LOGIN, { replace: true });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outlined"
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        borderColor: "primary.main",
        color: "primary.main",
        textTransform: "none",
        "&:hover": {
          backgroundColor: `${theme.palette.primary.main}15`,
        },
      }}
    >
      Log out
    </Button>
  );
}
