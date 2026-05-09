import api from "./axios";

export const applicationsAPI = {
  apply: (jobId, data) => {
    const formData = new FormData();
    if (data.coverLetter) formData.append("coverLetter", data.coverLetter);
    if (data.resume)      formData.append("resume", data.resume);
    return api.post(`/applications/${jobId}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getMyApplications:  (params) => api.get("/applications/my", { params }),
  withdraw:           (id)     => api.delete(`/applications/${id}/withdraw`),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  updateStatus:       (id, data)      => api.patch(`/applications/${id}/status`, data),
  getAdminStats:      ()              => api.get("/applications/admin/stats"),
};
