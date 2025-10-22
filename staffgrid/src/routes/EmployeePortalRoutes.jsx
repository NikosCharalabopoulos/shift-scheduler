// staffgrid/src/routes/EmployeePortalRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute"; // <-- προσαρμόσε αν έχεις άλλο path
import RoleGuard from "../components/RoleGuard";           // <-- προσαρμόσε αν έχεις άλλο path
import MySchedule from "../pages/employee/MySchedule";
import MyTimeOff from "../pages/employee/MyTimeOff";
import MyAvailability from "../pages/employee/MyAvailability";

export default function EmployeePortalRoutes() {
  return (
    <>
      <Route
        path="/my-schedule"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["EMPLOYEE"]}>
              <MySchedule />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-timeoff"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["EMPLOYEE"]}>
              <MyTimeOff />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-availability"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["EMPLOYEE"]}>
              <MyAvailability />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
    </>
  );
}
