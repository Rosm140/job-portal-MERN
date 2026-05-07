import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { applicationsAPI } from "@/api/applicationsAPI";
import { LoadingPage, EmptyState, StatusBadge, Button, Select } from "@/components/ui";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, Mail, Phone, MapPin,
  FileText, Download, ChevronDown, ChevronUp,
  CheckCircle2, Clock,
} from "lucide-react";

const STATUSES = ["pending", "reviewed", "shortlisted", "interviewed", "offered", "rejected"];

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationsAPI.getJobApplications(jobId, { status: filterStatus || undefined });
      setData(res.data);
    } catch {
      toast.error("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [jobId, filterStatus]);

  const handleStatusUpdate = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await applicationsAPI.updateStatus(appId, { status });
      toast.success(`Marked as ${status}`);
      setData((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a._id === appId ? { ...a, status } : a
        ),
      }));
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const resumeUrl = (path) => `${import.meta.env.VITE_API_URL?.replace("/api", "")}/${path}`;

  if (isLoading) return <LoadingPage message="Loading applicants..." />;

  const { job, applications = [], statusCounts = [], pagination } = data || {};

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <Link to="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to jobs
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{job?.title}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{job?.company?.name} · {pagination?.total || 0} applications</p>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {STATUSES.map((status) => {
            const count = statusCounts.find((s) => s._id === status)?.count || 0;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
                className={`p-3 rounded-xl border text-center transition-all
                  ${filterStatus === status
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/[0.07] bg-gray-900 hover:border-white/15"}`}
              >
                <p className="text-lg font-bold text-white">{count}</p>
                <p className="text-[10px] text-gray-400 capitalize mt-0.5">{status}</p>
              </button>
            );
          })}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No applicants yet"
            description="Share your job posting to attract candidates."
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicantCard
                key={app._id}
                app={app}
                isExpanded={expandedId === app._id}
                onToggle={() => setExpandedId(expandedId === app._id ? null : app._id)}
                onStatusChange={handleStatusUpdate}
                isUpdating={updatingId === app._id}
                resumeUrl={resumeUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicantCard = ({ app, isExpanded, onToggle, onStatusChange, isUpdating, resumeUrl }) => {
  const applicant = app.applicant;
  const [newStatus, setNewStatus] = useState(app.status);

  return (
    <div className="bg-gray-900 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/10 transition-all">
      {/* Summary Row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={onToggle}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
          {applicant?.fullName?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-medium text-sm">{applicant?.fullName || "Unknown"}</p>
            <StatusBadge status={app.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Mail size={10} />{applicant?.email}</span>
            {applicant?.location && <span className="flex items-center gap-1"><MapPin size={10} />{applicant.location}</span>}
            <span className="flex items-center gap-1"><Clock size={10} />{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {applicant?.skills?.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {applicant.skills.slice(0, 3).map((s) => (
                <span key={s} className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/10 px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          )}
          {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] px-5 py-5 space-y-5">
          {/* Bio */}
          {applicant?.bio && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">About</p>
              <p className="text-gray-300 text-sm">{applicant.bio}</p>
            </div>
          )}

          {/* Skills */}
          {applicant?.skills?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.skills.map((s) => (
                  <span key={s} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/10 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {applicant?.education?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Education</p>
              <div className="space-y-1">
                {applicant.education.map((e, i) => (
                  <div key={i} className="text-sm text-gray-300">
                    <span className="font-medium">{e.degree}</span> · {e.institution} · {e.year}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Cover Letter</p>
              <p className="text-sm text-gray-300 bg-white/5 rounded-xl p-4 leading-relaxed">{app.coverLetter}</p>
            </div>
          )}

          {/* Resume & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              {(app.resume?.path || applicant?.resume?.path) && (
                <a
                  href={resumeUrl(app.resume?.path || applicant?.resume?.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-2 rounded-lg transition-colors"
                >
                  <Download size={12} /> View Resume
                </a>
              )}
              {applicant?.phone && (
                <a href={`tel:${applicant.phone}`} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  <Phone size={11} />{applicant.phone}
                </a>
              )}
            </div>

            {/* Status Updater */}
            <div className="flex items-center gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="text-xs bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={() => onStatusChange(app._id, newStatus)}
                isLoading={isUpdating}
                disabled={newStatus === app.status}
              >
                <CheckCircle2 size={13} /> Update
              </Button>
            </div>
          </div>

          {/* Admin Notes */}
          {app.adminNotes && (
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-4 py-3">
              <p className="text-xs text-yellow-400 font-medium mb-1">Admin Note</p>
              <p className="text-xs text-gray-400">{app.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobApplicantsPage;
