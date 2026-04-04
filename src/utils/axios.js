/**
 * axios.js — Centralized Axios Instance
 *
 * Single source of truth for all HTTP calls in CarScout.
 *
 * What this does:
 * 1. Sets the base URL from the environment variable (falls back to localhost:4444).
 * 2. Attaches the JWT Bearer token from localStorage on every request.
 * 3. On every error response, extracts the backend's structured error message
 *    and shows a toast notification automatically.
 * 4. Clears the auth session and redirects to /login on 401 responses
 *    (expired or invalid tokens).
 */

import axios from "axios";
import { toast } from "react-toastify";
import { readAuthSession, clearAuthSession } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4444";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// Request Interceptor — Auto-attach Bearer token
// ─────────────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = readAuthSession()?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// Response Interceptor — Structured Error Handling
// ─────────────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  // Success — pass through
  (response) => response,

  // Error — extract message, show toast, handle 401
  (error) => {
    // Network / timeout errors (no response from server)
    if (!error.response) {
      toast.error(
        "Cannot reach the server. Please check your connection.",
        { toastId: "network-error" }  // toastId prevents duplicates
      );
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Extract the most useful message from the backend's error envelope:
    // { success: false, error: { code, message, errors[] } }
    const serverMessage =
      data?.error?.message ||
      data?.message ||
      "Something went wrong. Please try again.";

    // Collect field-level validation errors into a readable string
    const fieldErrors = data?.error?.errors;
    const detailedMessage =
      fieldErrors && fieldErrors.length > 0
        ? fieldErrors.map((e) => e.message).join(" • ")
        : serverMessage;

    switch (status) {
      case 400:
        // Validation errors — show all field messages
        toast.error(detailedMessage, { toastId: `err-400-${detailedMessage}` });
        break;

      case 401:
        // Authentication failed — clear session and redirect
        toast.error("Your session has expired. Please log in again.", {
          toastId: "err-401",
        });
        clearAuthSession();
        // Small delay so the toast is visible before redirect
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        break;

      case 403:
        toast.error("You do not have permission to perform this action.", {
          toastId: "err-403",
        });
        break;

      case 404:
        toast.error(serverMessage, { toastId: `err-404-${serverMessage}` });
        break;

      case 409:
        toast.error(serverMessage, { toastId: `err-409-${serverMessage}` });
        break;

      case 422:
        toast.error(serverMessage, { toastId: `err-422-${serverMessage}` });
        break;

      case 429:
        toast.warn("Too many requests. Please slow down and try again.", {
          toastId: "err-429",
        });
        break;

      case 500:
      case 502:
      case 503:
        toast.error("A server error occurred. Please try again later.", {
          toastId: "err-5xx",
        });
        break;

      default:
        toast.error(serverMessage);
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
