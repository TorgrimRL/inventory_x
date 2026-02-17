import "./App.css";
import "./components/utils/buttons.css";

import { Route, Routes } from "react-router-dom";

// PAGES
import Login from "./components/auth/loginForm";
import Registration from "./components/auth/registrationForm";
import RegisterInventoryForm from "./components/inventory/registerInventoryForm.tsx";
import Navbar from "./components/navbar/topbar.tsx";
import Dashboard from "./pages/dashboard";
import InventoriesPage from "./pages/inventories.tsx";
import ItemPage from "./pages/ItemPage";

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  REGISTRATION: "/registration",
  INVENTORIES: "/inventories",
  INVENTORIES_NEW: "/inventories/new",
  ADD_ITEM: "/add_item",
} as const;

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
        <Route path={PATHS.REGISTRATION} element={<Registration />} />
        <Route path={PATHS.INVENTORIES} element={<InventoriesPage />} />
        <Route
          path={PATHS.INVENTORIES_NEW}
          element={<RegisterInventoryForm />}
        />
        <Route path={PATHS.ADD_ITEM} element={<ItemPage />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
