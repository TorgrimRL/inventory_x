import "./App.css";
import "./components/utils/buttons.css";

import type { Dispatch, SetStateAction } from "react";
import { Route, Routes } from "react-router-dom";

// PAGES
import Login from "./components/auth/loginForm";
import Registration from "./components/auth/registrationForm";
import RegisterInventoryForm from "./components/inventory/registerInventoryForm.tsx";
import RequireActiveInventory from "./components/inventory/requireActiveInventory.tsx";
import Navbar from "./components/navbar/topbar.tsx";
import Dashboard from "./pages/dashboard";
import InventoriesPage from "./pages/inventories.tsx";
import InventoryMembersPage from "./pages/inventoryMembers.tsx";
import InviteEmployee from "./pages/InviteEmployee";
import ItemPage from "./pages/ItemPage";
import LandingPage from "./pages/landingPage";
import ForgotPassword from "./pages/PasswordForgot.tsx";
import ResetPassword from "./pages/PasswordReset.tsx";
import AuthGuardLayout from "./services/authguard.tsx";

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
    <div>
      <Navbar mode={mode} setMode={setMode} />
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
    </div>
  );
}

export default App;
