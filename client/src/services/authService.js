import api from "../api/axios.js";

/**
 * Auth service — thin wrapper around `/api/auth/*`.
 */

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const verifyEmail = async (token) => {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
};

export const resendVerification = async (email) => {
  const { data } = await api.post("/auth/resend-verification", { email });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.patch("/auth/change-password", payload);
  return data;
};

export const deleteAccount = async (payload) => {
  const { data } = await api.delete("/auth/delete-account", { data: payload });
  return data;
};
