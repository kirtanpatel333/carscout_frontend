/**
 * sellCarApi.js — Car Listing API Service
 *
 * Uses the centralized apiClient so all errors are automatically
 * handled (auth headers attached, toasts shown, 401 redirected).
 */

import apiClient from "../utils/axios";

export const sellCarApi = async (payload) => {
  const response = await apiClient.post("/car/add", payload);
  return response.data;
};

export const getAllCarsApi = async () => {
  const response = await apiClient.get("/car/all");
  return response.data;
};

export const getCarByIdApi = async (id) => {
  const response = await apiClient.get(`/car/${id}`);
  return response.data;
};

export const updateCarApi = async (id, payload) => {
  const response = await apiClient.put(`/car/${id}`, payload);
  return response.data;
};

export const deleteCarApi = async (id) => {
  const response = await apiClient.delete(`/car/${id}`);
  return response.data;
};
