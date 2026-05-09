import api from "./axios";

export const userAPI = {
  getProfile:     ()     => api.get("/users/profile"),
  updateProfile:  (data) => api.put("/users/profile", data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post("/users/upload-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteResume:    ()     => api.delete("/users/resume"),
  changePassword:  (data) => api.put("/users/change-password", data),
};
