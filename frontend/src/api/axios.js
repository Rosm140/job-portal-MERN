import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL;

// Fallback and auto-formatting
if (!baseURL) {
  console.warn("VITE_API_URL is missing! Defaulting to '/api'.");
  baseURL = "/api";
} else {
  // 1. Ensure it starts with http
  // 2. Ensure it ends with /api/ to prevent absolute path overrides
  if (baseURL.startsWith("http")) {
    if (!baseURL.endsWith("/api") && !baseURL.endsWith("/api/")) {
      baseURL = baseURL.endsWith("/") ? `${baseURL}api/` : `${baseURL}/api/`;
    } else if (!baseURL.endsWith("/")) {
      baseURL = `${baseURL}/`;
    }
  }
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;