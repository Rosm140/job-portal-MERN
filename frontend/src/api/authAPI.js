import api from "./axios";
export const authAPI = { register: (d) => api.post("/auth/register", d), login: (d) => api.post("/auth/login", d), getMe: () => api.get("/auth/me") };
