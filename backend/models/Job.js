const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],

    company: {
      name: { type: String, required: true, trim: true },
      website: { type: String, trim: true },
      logo: { type: String, default: "" },
      description: { type: String },
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      default: "onsite",
    },

    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      required: [true, "Job type is required"],
    },

    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
      period: { type: String, enum: ["monthly", "yearly", "hourly"], default: "yearly" },
      isVisible: { type: Boolean, default: true },
    },

    skills: [{ type: String, trim: true }],

    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior", "lead"],
      default: "fresher",
    },

    openings: { type: Number, default: 1 },

    deadline: { type: Date },

    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: "text", description: "text", "company.name": "text", skills: "text" });

module.exports = mongoose.model("Job", jobSchema);
