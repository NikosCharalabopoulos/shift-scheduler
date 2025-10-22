import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Schedule from "./pages/Schedule"; // ✅ νέο import

// Employee Portal pages
import MySchedule from "./pages/employee/MySchedule";
import MyTimeOff from "./pages/employee/MyTimeOff";
import MyAvailability from "./pages/employee/MyAvailability";

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

        {/* ✅ Admin schedule */}
        <Route
          path="/schedule"
          element={
            <RoleGuard allow={["OWNER", "MANAGER"]}>
              <Schedule />
            </RoleGuard>
          }
        />

        {/* ✅ Employee Portal routes */}
        <Route
          path="/my-schedule"
          element={
            <RoleGuard allow={["EMPLOYEE"]}>
              <MySchedule />
            </RoleGuard>
          }
        />
        <Route
          path="/my-timeoff"
          element={
            <RoleGuard allow={["EMPLOYEE"]}>
              <MyTimeOff />
            </RoleGuard>
          }
        />
        <Route
          path="/my-availability"
          element={
            <RoleGuard allow={["EMPLOYEE"]}>
              <MyAvailability />
            </RoleGuard>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  );
}
