const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const { sendResponse } = require("../utils/helpers");

// ─── @POST /api/applications/:jobId/apply (Student) ───────────────────────────
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return sendResponse(res, 404, false, "Job not found.");
    if (job.status !== "active") return sendResponse(res, 400, false, "This job is no longer accepting applications.");

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return sendResponse(res, 409, false, "You have already applied for this job.");

    // Use uploaded resume OR profile resume
    let resumeData = null;
    if (req.file) {
      resumeData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `uploads/resumes/${req.file.filename}`,
      };
    } else {
      const user = await User.findById(req.user._id);
      if (user.resume?.filename) {
        resumeData = {
          filename: user.resume.filename,
          originalName: user.resume.originalName,
          path: user.resume.path,
        };
      }
    }

    if (!resumeData) {
      return sendResponse(res, 400, false, "Please upload a resume or add one to your profile before applying.");
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume: resumeData,
      statusHistory: [{ status: "pending", note: "Application submitted via web portal", createdAt: new Date() }],
    });

    // Increment applicants count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    const populated = await application.populate([
      { path: "job", select: "title company location jobType" },
      { path: "applicant", select: "fullName email" },
    ]);

    sendResponse(res, 201, true, "Application submitted successfully!", { application: populated });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/applications/my (Student) ──────────────────────────────────────
const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { applicant: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("job", "title company location jobType salary status deadline")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    sendResponse(res, 200, true, "Your applications.", {
      applications,
      pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/applications/:id/withdraw (Student) ─────────────────────────
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id,
    });

    if (!application) return sendResponse(res, 404, false, "Application not found.");
    if (application.status === "offered") return sendResponse(res, 400, false, "Cannot withdraw an offered application.");
    if (application.status === "withdrawn") return sendResponse(res, 400, false, "Application is already withdrawn.");

    // Update job count first to ensure consistency
    await Job.findByIdAndUpdate(application.job, { $inc: { applicantsCount: -1 } });

    application.status = "withdrawn";
    application.statusHistory.push({ status: "withdrawn", note: "Withdrawn by applicant" });
    await application.save();

    sendResponse(res, 200, true, "Application withdrawn.");
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/applications/job/:jobId (Admin) ────────────────────────────────
const getApplicationsForJob = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
    if (!job) return sendResponse(res, 404, false, "Job not found or unauthorized.");

    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("applicant", "fullName email phone location skills education experience resume avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    // Status summary
    const statusCounts = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    sendResponse(res, 200, true, "Applications fetched.", {
      job: { title: job.title, company: job.company },
      applications,
      statusCounts,
      pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PATCH /api/applications/:id/status (Admin) ──────────────────────────────
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, adminNotes } = req.body;

    const validStatuses = ["pending", "reviewed", "shortlisted", "interviewed", "offered", "rejected"];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, "Invalid status value.");
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return sendResponse(res, 404, false, "Application not found.");

    // Ensure admin owns this job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "Not authorized.");
    }

    application.status = status;
    application.statusHistory.push({ status, note: note || "" });
    if (adminNotes) application.adminNotes = adminNotes;
    await application.save();

    sendResponse(res, 200, true, `Application status updated to '${status}'.`, { application });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/applications/admin/stats (Admin) ───────────────────────────────
const getAdminStats = async (req, res, next) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user._id }).select("_id");
    const jobIds = myJobs.map((j) => j._id);

    const totalJobs = myJobs.length;
    const activeJobs = await Job.countDocuments({ postedBy: req.user._id, status: "active" });
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const pendingApplications = await Application.countDocuments({ job: { $in: jobIds }, status: "pending" });
    const shortlisted = await Application.countDocuments({ job: { $in: jobIds }, status: "shortlisted" });

    sendResponse(res, 200, true, "Dashboard stats.", {
      stats: { totalJobs, activeJobs, totalApplications, pendingApplications, shortlisted },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob, getMyApplications, withdrawApplication,
  getApplicationsForJob, updateApplicationStatus, getAdminStats,
};
