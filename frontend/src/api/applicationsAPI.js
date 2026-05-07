import api from "./axios";
export const applicationsAPI = {
  apply: (jobId, data) => { const f = new FormData(); if (data.coverLetter) f.append("coverLetter", data.coverLetter); if (data.resume) f.append("resume", data.resume); return api.post(`/applications/${jobId}/apply`, f, { headers: { "Content-Type": "multipart/form-data" } }); },
  getMyApplications: (p) => api.get("/applications/my", { params: p }),
  withdraw: (id) => api.delete(`/applications/${id}/withdraw`),
  getJobApplications: (jobId, p) => api.get(`/applications/job/${jobId}`, { params: p }),
  updateStatus: (id, d) => api.patch(`/applications/${id}/status`, d),
  getAdminStats: () => api.get("/applications/admin/stats"),
};
