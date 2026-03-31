import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { PATHS } from "../../App";
import { checkSession } from "../../services/authService";
import {
  type ActiveInventory,
  getActiveInventory,
} from "../../services/inventoryService";
import LogoutButton from "../auth/logoutButton";
import { ThemeSwitch } from "./themeSwitch";

type ThemeMode = "light" | "dark";

interface NavbarProps {
  mode: ThemeMode;
  setMode: Dispatch<SetStateAction<ThemeMode>>;
}
export default function Navbar({ mode, setMode }: NavbarProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const [isValidSession, setIsValidSession] = useState(false);
  const [activeInventory, setActiveInventory] =
    useState<ActiveInventory | null>(null);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const openMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const closeMobileMenu = () => {
    setAnchorElNav(null);
  };

  const authNavItems = [
    ["Inventories", PATHS.INVENTORIES],
    ["Dashboard", PATHS.DASHBOARD],
    ["Items", PATHS.ADD_ITEM],
  ];

  useEffect(() => {
    async function verifySession() {
      try {
        const session = await checkSession();
        setIsValidSession(session);
      } catch {
        setIsValidSession(false);
      }
    }

    verifySession();
  }, [location.pathname]);

  /* Load active inventory. Runs when: session changes or route changes */
  useEffect(() => {
    if (!isValidSession) return;

    async function loadInventory() {
      try {
        const active = await getActiveInventory();
        setActiveInventory(active);
      } catch {
        setActiveInventory(null);
      }
    }

    loadInventory();
  }, [location.pathname, isValidSession]);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* LOGO */}
          <Typography
            component={RouterLink}
            to={PATHS.HOME}
            variant="h6"
            sx={{
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: 1.5,
              background: theme.gradients.text,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            INVENTORY X
          </Typography>

          {/* DESKTOP NAV */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {isValidSession ? (
              <>
                {authNavItems.map(([name, path]) => {
                  const isActive = location.pathname === path;
                  return (
                    <Button
                      key={path}
                      component={RouterLink}
                      to={path}
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        px: 1.5,
                        fontSize: "1rem",
                        borderRadius: 0,
                        color: isActive ? "primary.main" : "text.primary",
                        borderBottom: isActive
                          ? `2px solid ${theme.palette.primary.main}`
                          : "2px solid transparent",
                        transition: "color 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          color:
                            theme.palette.mode === "dark"
                              ? theme.palette.secondary.main
                              : theme.palette.primary.main,
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      {name}
                    </Button>
                  );
                })}

                {/* Active inventory */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    borderLeft: 1,
                    borderColor: "divider",
                    pl: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeInventory
                    ? `${activeInventory.name}`
                    : "No inventory selected"}
                </Typography>

                <LogoutButton />
              </>
            ) : (
              <>
                {location.pathname !== PATHS.LOGIN && (
                  <Button
                    component={RouterLink}
                    to={PATHS.LOGIN}
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
                    Log In
                  </Button>
                )}

                {location.pathname !== PATHS.REGISTRATION && (
                  <>
                    <Button
                      component={RouterLink}
                      to={PATHS.REGISTRATION}
                      variant="contained"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        background: theme.gradients.button,
                        color: "background.default",
                        "&:hover": {
                          background: theme.gradients.button,
                          opacity: 0.9,
                        },
                      }}
                    >
                      Sign Up
                    </Button>

                    <Button
                      component={RouterLink}
                      to={PATHS.PASSWORD_FORGOT}
                      variant="text"
                    >
                      Forgot password
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Theme switch */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ThemeSwitch
                checked={mode === "dark"}
                onChange={toggleTheme}
                slotProps={{ input: { "aria-label": "Toggle theme" } }}
                icon={
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LightModeIcon
                      sx={{ fontSize: 16, color: "common.white" }}
                    />
                  </Box>
                }
                checkedIcon={
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.secondary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DarkModeIcon
                      sx={{ fontSize: 16, color: "common.white" }}
                    />
                  </Box>
                }
              />
            </Box>
          </Box>

          {/* MOBILE MENU */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Active inventory (visible on mobile) */}
            {isValidSession && (
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                }}
              >
                {activeInventory
                  ? activeInventory.name
                  : "No inventory selected"}
              </Typography>
            )}

            <IconButton
              onClick={openMobileMenu}
              sx={{ color: "text.primary", ml: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={closeMobileMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: { sx: { minWidth: 180 } },
              }}
            >
              {isValidSession
                ? [
                    ...authNavItems.map(([name, path]) => (
                      <MenuItem
                        key={path}
                        component={RouterLink}
                        to={path}
                        onClick={closeMobileMenu}
                      >
                        {name}
                      </MenuItem>
                    )),

                    <MenuItem
                      key="logout"
                      onClick={() => {
                        closeMobileMenu();
                      }}
                    >
                      <LogoutButton />
                    </MenuItem>,
                  ]
                : [
                    <MenuItem
                      key="login"
                      onClick={() => {
                        navigate(PATHS.LOGIN);
                        closeMobileMenu();
                      }}
                    >
                      Log In
                    </MenuItem>,

                    <MenuItem
                      key="signup"
                      onClick={() => {
                        navigate(PATHS.REGISTRATION);
                        closeMobileMenu();
                      }}
                    >
                      Sign Up
                    </MenuItem>,

                    <MenuItem
                      key="forgot"
                      onClick={() => {
                        navigate(PATHS.PASSWORD_FORGOT);
                        closeMobileMenu();
                      }}
                    >
                      Forgot password
                    </MenuItem>,
                  ]}
              <MenuItem
                onClick={() => {
                  toggleTheme();
                  closeMobileMenu();
                }}
              >
                {mode === "dark" ? (
                  <>
                    <LightModeIcon sx={{ mr: 1 }} />
                    Light mode
                  </>
                ) : (
                  <>
                    <DarkModeIcon sx={{ mr: 1 }} />
                    Dark mode
                  </>
                )}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
