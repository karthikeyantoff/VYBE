import { useCallback, useEffect, useMemo, useState } from "react";

import * as authService from "../services/authService.js";
import { TOKEN_STORAGE_KEY } from "../utils/constants.js";
import { AuthContext } from "./useAuth.js";

/**
 * AuthContext — single source of truth for the signed-in user.
 */

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    authService
      .getMe()
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setUser(data.user);
    setToken(data.token);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    if (data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const isAdmin = useCallback(() => user?.role === "admin", [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAdmin,
    }),
    [user, token, loading, login, register, logout, updateUser, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
