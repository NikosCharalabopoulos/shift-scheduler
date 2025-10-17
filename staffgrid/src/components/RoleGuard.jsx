import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ allow = [], children }) {
  const { user } = useAuth();
  if (!user) return null;
  if (allow.length && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}