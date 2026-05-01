import api from "./axios";

export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params) => api.get("/jobs/admin/my-jobs", { params }),
  toggleStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
};
