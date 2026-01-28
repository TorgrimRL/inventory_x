
// REACT libs
// CSS
import "./App.css";
import "./components/utils/buttons.css";

import { Route, Routes } from "react-router-dom";

// PAGES
import LoginPage from "./components/auth/loginForm";
import Registration from "./components/auth/registrationForm";
import Dashboard from "./pages/dashboard";
import AddItemPage from "./pages/AddItemPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/add_item" element={<AddItemPage />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
