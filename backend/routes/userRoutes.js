const express = require("express");
const router = express.Router();
const {
  getProfile, updateProfile, uploadResume,
  deleteResume, changePassword, getAllUsers,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/upload-resume", protect, authorize("student"), upload.single("resume"), uploadResume);
router.delete("/resume", protect, authorize("student"), deleteResume);
router.put("/change-password", protect, changePassword);
router.get("/", protect, authorize("admin"), getAllUsers);

module.exports = router;
