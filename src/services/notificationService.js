/**
 * notificationService.js — Notification API Service
 *
 * Uses the centralized apiClient so all errors are automatically
 * handled (auth headers attached, toasts shown, 401 redirected).
 */

import apiClient from "../utils/axios";

export const getMyNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get("/notification/my", {
    params: { page, limit },
  });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await apiClient.get("/notification/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await apiClient.put(`/notification/${id}/read`, {});
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.put("/notification/read-all", {});
  return response.data;
};

export const deleteNotificationById = async (id) => {
  const response = await apiClient.delete(`/notification/${id}`);
  return response.data;
};

export const createNotificationForUser = async (payload) => {
  const response = await apiClient.post("/notification/create", payload);
  return response.data;
};
