const express = require("express");
const router = express.Router();
const {
  applyForJob, getMyApplications, withdrawApplication,
  getApplicationsForJob, updateApplicationStatus, getAdminStats,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Student routes
router.post("/:jobId/apply", protect, authorize("student"), upload.single("resume"), applyForJob);
router.get("/my", protect, authorize("student"), getMyApplications);
router.delete("/:id/withdraw", protect, authorize("student"), withdrawApplication);

// Admin routes
router.get("/admin/stats", protect, authorize("admin"), getAdminStats);
router.get("/job/:jobId", protect, authorize("admin"), getApplicationsForJob);
router.patch("/:id/status", protect, authorize("admin"), updateApplicationStatus);

module.exports = router;
