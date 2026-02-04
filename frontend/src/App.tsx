import "./App.css";
import "./components/utils/buttons.css";

import { Route, Routes } from "react-router-dom";

// PAGES
import Login from "./components/auth/loginForm";
import Registration from "./components/auth/registrationForm";
import RegisterInventoryForm from "./components/inventory/registerInventoryForm.tsx";
import Dashboard from "./pages/dashboard";
import InventoriesPage from "./pages/inventories.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/inventories" element={<InventoriesPage />} />
      <Route path="/inventories/new" element={<RegisterInventoryForm />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
