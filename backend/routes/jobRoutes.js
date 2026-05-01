const express = require("express");
const router = express.Router();
const {
  getAllJobs, getJobById, createJob, updateJob,
  deleteJob, getMyPostedJobs, toggleJobStatus,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public (optional auth to check hasApplied)
router.get("/", (req, res, next) => {
  // Attach user if token provided (optional auth)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    return protect(req, res, () => getAllJobs(req, res, next));
  }
  getAllJobs(req, res, next);
});

router.get("/admin/my-jobs", protect, authorize("admin"), getMyPostedJobs);

router.get("/:id", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    return protect(req, res, () => getJobById(req, res, next));
  }
  getJobById(req, res, next);
});

router.post("/", protect, authorize("admin"), createJob);
router.put("/:id", protect, authorize("admin"), updateJob);
router.delete("/:id", protect, authorize("admin"), deleteJob);
router.patch("/:id/status", protect, authorize("admin"), toggleJobStatus);

module.exports = router;
