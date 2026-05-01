const User = require("../models/User");
const { sendResponse } = require("../utils/helpers");
const fs = require("fs");
const path = require("path");

// ─── @GET /api/users/profile ───────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendResponse(res, 200, true, "Profile fetched.", { user });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/users/profile ───────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "fullName", "phone", "location", "bio",
      "skills", "education", "experience",
      "companyName", "companyWebsite", "companyDescription",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    sendResponse(res, 200, true, "Profile updated successfully.", { user });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/users/upload-resume ───────────────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, "No file uploaded.");
    }

    // Delete old resume file if it exists
    const currentUser = await User.findById(req.user._id);
    if (currentUser.resume?.path) {
      const oldPath = path.join(__dirname, "..", currentUser.resume.path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const resumeData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resume: resumeData },
      { new: true }
    );

    sendResponse(res, 200, true, "Resume uploaded successfully.", {
      resume: user.resume,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/users/resume ─────────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.resume?.path) {
      return sendResponse(res, 404, false, "No resume found.");
    }

    const filePath = path.join(__dirname, "..", user.resume.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await User.findByIdAndUpdate(req.user._id, { $unset: { resume: 1 } });
    sendResponse(res, 200, true, "Resume deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/users/change-password ──────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, 400, false, "Please provide current and new password.");
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return sendResponse(res, 401, false, "Current password is incorrect.");
    }

    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, true, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users (Admin only) ─────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    sendResponse(res, 200, true, "Users fetched.", {
      users,
      pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadResume, deleteResume, changePassword, getAllUsers };
