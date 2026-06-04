// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider }         from "./context/ToastContext.jsx";
import "./styles/global.css";
import LoginPage    from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function RequireCEO({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-overlay" style={{ height:"100vh" }}>
      <span className="spinner" /> Loading…
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/*"      element={<RequireCEO><DashboardPage /></RequireCEO>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
