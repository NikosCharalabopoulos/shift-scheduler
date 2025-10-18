import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Schedule from "./pages/Schedule"; // ✅ νέο import

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/users"
          element={
            <RoleGuard allow={["OWNER", "MANAGER"]}>
              <Users />
            </RoleGuard>
          }
        />

        <Route
          path="/departments"
          element={
            <RoleGuard allow={["OWNER", "MANAGER"]}>
              <Departments />
            </RoleGuard>
          }
        />

        <Route
          path="/employees"
          element={
            <RoleGuard allow={["OWNER", "MANAGER"]}>
              <Employees />
            </RoleGuard>
          }
        />

        {/* ✅ ΝΕΟ ROUTE για το Schedule */}
        <Route
          path="/schedule"
          element={
            <RoleGuard allow={["OWNER", "MANAGER"]}>
              <Schedule />
            </RoleGuard>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  );
}
