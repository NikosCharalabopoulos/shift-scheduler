import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getErrorMessage } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Bootstrap session από /auth/me
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!ignore) setUser(data.user);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setBootstrapping(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      setError(getErrorMessage(err));
      return { ok: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
  }, []);

  const value = { user, loading, error, login, logout, bootstrapping };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
