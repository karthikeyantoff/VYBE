import api from "./api.js";

export const getDashboardStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data.stats;
};

export const getAdminUsers = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
  return data;
};

export const toggleUserStatus = async (userId) => {
  const { data } = await api.patch(`/admin/users/${userId}/status`);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
};

export const getAdminPosts = async (params = {}) => {
  const { data } = await api.get("/admin/posts", { params });
  return data;
};

export const togglePostHidden = async (postId) => {
  const { data } = await api.patch(`/admin/posts/${postId}/hidden`);
  return data;
};

export const deletePost = async (postId) => {
  const { data } = await api.delete(`/admin/posts/${postId}`);
  return data;
};

export const getAdminComments = async (params = {}) => {
  const { data } = await api.get("/admin/comments", { params });
  return data;
};

export const deleteComment = async (commentId) => {
  const { data } = await api.delete(`/admin/comments/${commentId}`);
  return data;
};
