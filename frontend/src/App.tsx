import "./App.css";
import "./components/utils/buttons.css";

import { Route, Routes } from "react-router-dom";

// PAGES
import Login from "./components/auth/loginForm";
import Registration from "./components/auth/registrationForm";
import RegisterInventoryForm from "./components/inventory/registerInventoryForm.tsx";
import Dashboard from "./pages/dashboard";
import InventoriesPage from "./pages/inventories.tsx";
import ItemPage from "./pages/ItemPage";

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  REGISTRATION: '/registration',
  INVENTORY: {
    LIST: '/inventories',
    CREATE: '/inventories/new',
  },
  ITEMS: {
    ADD: '/add_item',
  },
} as const;


function App() {
  return (
    <Routes>
      <Route path={PATHS.LOGIN} element={<Login />} />
      <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
      <Route path={PATHS.REGISTRATION} element={<Registration />} />
      <Route path={PATHS.INVENTORY.LIST} element={<InventoriesPage />} />
      <Route path={PATHS.INVENTORY.CREATE} element={<RegisterInventoryForm />} />
      <Route path={PATHS.ITEMS.ADD} element={<ItemPage />} />

      {/* Catch-all for 404s */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
