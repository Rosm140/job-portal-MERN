import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { applicationsAPI } from "../../api/applicationsAPI";
import { LoadingPage, EmptyState, StatusBadge, Button } from "../../components/ui";
import toast from "react-hot-toast";
import {
  Users, ArrowLeft, Mail, Phone, MapPin,
  FileText, Download, ChevronDown, CheckCircle2,
  ExternalLink, Briefcase,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Rejected" },
];

const ViewApplicantsPage = () => {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await applicationsAPI.getJobApplications(jobId, statusFilter ? { status: statusFilter } : {});
      setData(res.data);
    } catch (err) {
      toast.error("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [statusFilter]);

  const handleStatusUpdate = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await applicationsAPI.updateStatus(appId, { status });
      toast.success(`Status updated to "${status}".`);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <LoadingPage message="Loading applicants..." />;

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back + Header */}
        <Link to="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Jobs
        </Link>

        {data?.job && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{data.job.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{data.job.company?.name}</p>
          </div>
        )}

        {/* Status summary pills */}
        {data?.statusCounts?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setStatusFilter("")}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!statusFilter ? "bg-blue-600 text-white border-blue-500" : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"}`}
            >
              All ({data.pagination?.total || 0})
            </button>
            {data.statusCounts.map(({ _id, count }) => (
              <button
                key={_id}
                onClick={() => setStatusFilter(_id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${statusFilter === _id ? "bg-blue-600 text-white border-blue-500" : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"}`}
              >
                {_id} ({count})
              </button>
            ))}
          </div>
        )}

        {/* Applicant list */}
        {!data?.applications?.length ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No applicants yet"
            description="Share your job posting to attract candidates."
          />
        ) : (
          <div className="space-y-3">
            {data.applications.map((app) => (
              <ApplicantCard
                key={app._id}
                app={app}
                expanded={expandedId === app._id}
                onToggle={() => setExpandedId(expandedId === app._id ? null : app._id)}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updatingId === app._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicantCard = ({ app, expanded, onToggle, onStatusUpdate, isUpdating }) => {
  const applicant = app.applicant;
  const [newStatus, setNewStatus] = useState(app.status);

  return (
    <div className="bg-gray-900 border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Summary Row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={onToggle}
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
          {applicant?.fullName?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-white font-medium text-sm">{applicant?.fullName}</p>
            <StatusBadge status={app.status} />
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Mail size={10} /> {applicant?.email}</span>
            {applicant?.phone && <span className="flex items-center gap-1"><Phone size={10} /> {applicant.phone}</span>}
            {applicant?.location && <span className="flex items-center gap-1"><MapPin size={10} /> {applicant.location}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500">
            {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          <ChevronDown size={14} className={`text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-5 py-5 space-y-5">
          {/* Skills */}
          {applicant?.skills?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.skills.map((s) => (
                  <span key={s} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/10 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Cover Letter</p>
              <p className="text-sm text-gray-300 bg-gray-800/60 rounded-xl p-4 leading-relaxed whitespace-pre-line">
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* Resume */}
          {app.resume?.path && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Resume</p>
              <a
                href={`${API_URL}/${app.resume.path}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/5 border border-blue-500/10 px-3 py-2 rounded-lg transition-colors"
              >
                <FileText size={14} />
                {app.resume.originalName}
                <Download size={12} />
              </a>
            </div>
          )}

          {/* Education */}
          {applicant?.education?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Education</p>
              <div className="space-y-1">
                {applicant.education.map((edu, i) => (
                  <p key={i} className="text-sm text-gray-300">
                    {edu.degree} — <span className="text-gray-400">{edu.institution}</span>
                    {edu.year && <span className="text-gray-500"> ({edu.year})</span>}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="pt-3 border-t border-white/[0.06]">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Update Application Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  disabled={isUpdating}
                  onClick={() => { setNewStatus(value); onStatusUpdate(app._id, value); }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize disabled:opacity-50
                    ${app.status === value
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-200"
                    }`}
                >
                  {isUpdating && newStatus === value ? "Saving..." : label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplicantsPage;
