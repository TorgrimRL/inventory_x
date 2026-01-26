// REACT libs
import { Routes, Route } from "react-router-dom";

// PAGES
import LoginPage from "./components/auth/loginForm";
import Dashboard from "./pages/dashboard";
import Registration from "./components/auth/registrationForm";

// CSS
import "./App.css";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
