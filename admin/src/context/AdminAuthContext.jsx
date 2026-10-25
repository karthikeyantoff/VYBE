import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vybe_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vybe_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.user?.role === "admin") {
          setAdminUser(res.data.user);
          localStorage.setItem("vybe_admin_user", JSON.stringify(res.data.user));
        } else {
          logout();
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    if (user.role !== "admin") {
      throw new Error("Access denied. Admin credentials required.");
    }
    localStorage.setItem("vybe_admin_token", token);
    localStorage.setItem("vybe_admin_user", JSON.stringify(user));
    setAdminUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("vybe_admin_token");
    localStorage.removeItem("vybe_admin_user");
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser && adminUser.role === "admin"),
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
