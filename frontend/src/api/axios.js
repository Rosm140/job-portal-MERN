import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" }, withCredentials: true });
api.interceptors.request.use((config) => { const t = localStorage.getItem("token"); if (t) config.headers.Authorization = `Bearer ${t}`; return config; }, (e) => Promise.reject(e));
api.interceptors.response.use((r) => r, (e) => { if (e.response?.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); if (window.location.pathname !== "/login") window.location.href = "/login"; } return Promise.reject(e); });
export default api;
