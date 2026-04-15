import "./App.css";

import { Box } from "@mui/material";
import { type Dispatch, lazy, type SetStateAction, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// PAGES
import RequireActiveInventory from "./components/inventory/requireActiveInventory.tsx";
import Navbar from "./components/navbar/topbar.tsx";
import ItemPage from "./pages/ItemPage";
import AuthGuardLayout from "./services/authguard.tsx";

const Login = lazy(() => import("./components/auth/loginForm"));
const Registration = lazy(() => import("./components/auth/registrationForm"));
const RegisterInventoryForm = lazy(
  () => import("./components/inventory/registerInventoryForm.tsx"),
);
const Dashboard = lazy(() => import("./pages/dashboard"));
const InventoriesPage = lazy(() => import("./pages/inventories.tsx"));
const InventoryMembersPage = lazy(() => import("./pages/inventoryMembers.tsx"));
const InviteEmployee = lazy(() => import("./pages/InviteEmployee"));
const LandingPage = lazy(() => import("./pages/landingPage"));
const ForgotPassword = lazy(() => import("./pages/PasswordForgot.tsx"));
const ResetPassword = lazy(() => import("./pages/PasswordReset.tsx"));

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  REGISTRATION: "/registration",
  INVENTORIES: "/inventories",
  INVENTORIES_NEW: "/inventories/new",
  ADD_ITEM: "/add_item",
  PASSWORD_FORGOT: "/password_forgot",
  PASSWORD_RESET: "/password_reset",
  INVITE_EMPLOYEE: "/invite_employee",
  INVENTORY_MEMBERS: "/inventory_members",
} as const;

type ThemeMode = "light" | "dark";
interface AppProps {
  mode: ThemeMode;
  setMode: Dispatch<SetStateAction<ThemeMode>>;
}
function App({ mode, setMode }: AppProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar mode={mode} setMode={setMode} />
      <Suspense
        fallback={<Box sx={{ p: 4, textAlign: "center" }}>Loading page...</Box>}
      >
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path={PATHS.HOME} element={<LandingPage />} />
          <Route path={PATHS.LOGIN} element={<Login />} />
          <Route path={PATHS.REGISTRATION} element={<Registration />} />
          <Route path={PATHS.PASSWORD_RESET} element={<ResetPassword />} />
          <Route path={PATHS.PASSWORD_FORGOT} element={<ForgotPassword />} />

          <Route path="*" element={<div>404 - Page Not Found</div>} />

          {/* --- PROTECTED ROUTES --- */}
          <Route element={<AuthGuardLayout />}>
            <Route
              path={PATHS.DASHBOARD}
              element={
                <RequireActiveInventory>
                  <Dashboard />
                </RequireActiveInventory>
              }
            />
            <Route path={PATHS.INVENTORIES} element={<InventoriesPage />} />
            <Route
              path={PATHS.INVENTORIES_NEW}
              element={<RegisterInventoryForm />}
            />
            <Route
              path={PATHS.ADD_ITEM}
              element={
                <RequireActiveInventory>
                  <ItemPage />
                </RequireActiveInventory>
              }
            />
            <Route
              path={PATHS.INVITE_EMPLOYEE}
              element={
                <RequireActiveInventory>
                  <InviteEmployee />
                </RequireActiveInventory>
              }
            />
            <Route
              path={PATHS.INVENTORY_MEMBERS}
              element={
                <RequireActiveInventory>
                  <InventoryMembersPage />
                </RequireActiveInventory>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </Box>
  );
}

export default App;
