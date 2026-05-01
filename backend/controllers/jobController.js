const Job = require("../models/Job");
const Application = require("../models/Application");
const { sendResponse } = require("../utils/helpers");

// ─── @GET /api/jobs ────────────────────────────────────────────────────────────
const getAllJobs = async (req, res, next) => {
  try {
    const {
      search, location, jobType, locationType,
      experienceLevel, skills, status = "active",
      page = 1, limit = 12, sortBy = "createdAt",
    } = req.query;

    const query = {};

    // Status filter (public sees only active)
    if (req.user?.role === "admin") {
      if (status) query.status = status;
    } else {
      query.status = "active";
    }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "company.name": { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (location) query.location = { $regex: location, $options: "i" };
    if (jobType) query.jobType = jobType;
    if (locationType) query.locationType = locationType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim());
      query.skills = { $in: skillList.map((s) => new RegExp(s, "i")) };
    }

    const sortOptions = {
      createdAt: { createdAt: -1 },
      salary: { "salary.max": -1 },
      applicants: { applicantsCount: -1 },
    };

    const jobs = await Job.find(query)
      .populate("postedBy", "fullName companyName avatar")
      .sort(sortOptions[sortBy] || { createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    sendResponse(res, 200, true, "Jobs fetched.", {
      jobs,
      pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/jobs/:id ────────────────────────────────────────────────────────
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "fullName companyName companyWebsite avatar"
    );

    if (!job) {
      return sendResponse(res, 404, false, "Job not found.");
    }

    // Check if current user has applied (if authenticated)
    let hasApplied = false;
    if (req.user) {
      const app = await Application.findOne({ job: job._id, applicant: req.user._id });
      hasApplied = !!app;
    }

    sendResponse(res, 200, true, "Job fetched.", { job, hasApplied });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/jobs (Admin only) ─────────────────────────────────────────────
const createJob = async (req, res, next) => {
  try {
    const {
      title, description, requirements, responsibilities,
      location, locationType, jobType, salary, skills,
      experienceLevel, openings, deadline, status,
    } = req.body;

    const adminUser = req.user;

    const job = await Job.create({
      title, description, requirements, responsibilities,
      location, locationType, jobType, salary, skills,
      experienceLevel, openings, deadline, status,
      company: {
        name: adminUser.companyName || "Unknown Company",
        website: adminUser.companyWebsite || "",
        description: adminUser.companyDescription || "",
      },
      postedBy: adminUser._id,
    });

    sendResponse(res, 201, true, "Job posted successfully.", { job });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/jobs/:id (Admin only) ──────────────────────────────────────────
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return sendResponse(res, 404, false, "Job not found.");

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "Not authorized to edit this job.");
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendResponse(res, 200, true, "Job updated successfully.", { job: updatedJob });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/jobs/:id (Admin only) ───────────────────────────────────────
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return sendResponse(res, 404, false, "Job not found.");

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "Not authorized to delete this job.");
    }

    // Also remove all applications
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    sendResponse(res, 200, true, "Job deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/jobs/admin/my-jobs (Admin only) ────────────────────────────────
const getMyPostedJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments({ postedBy: req.user._id });

    sendResponse(res, 200, true, "Your posted jobs.", {
      jobs,
      pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/jobs/:id/status (Admin only) ─────────────────────────────────
const toggleJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      { status },
      { new: true }
    );
    if (!job) return sendResponse(res, 404, false, "Job not found.");
    sendResponse(res, 200, true, `Job marked as ${status}.`, { job });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs, getJobById, createJob, updateJob,
  deleteJob, getMyPostedJobs, toggleJobStatus,
};
