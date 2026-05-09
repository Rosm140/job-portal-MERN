import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { applicationsAPI } from "../../api/applicationsAPI";
import { LoadingPage, EmptyState, StatusBadge, Button } from "../../components/ui";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Mail, Phone, MapPin, Download, ChevronDown, ChevronUp, CheckCircle2, Clock } from "lucide-react";

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
    } catch { toast.error("Failed to fetch applications."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, [jobId, filterStatus]);

  const handleStatusUpdate = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await applicationsAPI.updateStatus(appId, { status });
      toast.success(`Marked as ${status}`);
      setData((prev) => ({ ...prev, applications: prev.applications.map((a) => a._id === appId ? { ...a, status } : a) }));
    } catch { toast.error("Failed to update."); }
    finally { setUpdatingId(null); }
  };

  const resumeUrl = (path) => `${import.meta.env.VITE_API_URL?.replace("/api", "")}/${path}`;

  if (isLoading) return <LoadingPage message="Loading applicants..." />;

  const { job, applications = [], statusCounts = [], pagination } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to jobs
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{job?.title}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{job?.company?.name} · {pagination?.total || 0} applications</p>
          </div>
        </div>

        {/* Status summary chips */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {STATUSES.map((status) => {
            const count = statusCounts.find((s) => s._id === status)?.count || 0;
            return (
              <button key={status} onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
                className={`p-3 rounded-xl border text-center transition-all
                  ${filterStatus === status ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"}`}>
                <p className="text-lg font-black text-gray-900">{count}</p>
                <p className="text-[10px] text-gray-400 capitalize mt-0.5">{status}</p>
              </button>
            );
          })}
        </div>

        {applications.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="No applicants yet" description="Share your job posting to attract candidates." />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicantCard key={app._id} app={app}
                isExpanded={expandedId === app._id}
                onToggle={() => setExpandedId(expandedId === app._id ? null : app._id)}
                onStatusChange={handleStatusUpdate}
                isUpdating={updatingId === app._id}
                resumeUrl={resumeUrl} />
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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 transition-all">
      <button className="w-full flex items-center gap-4 px-5 py-4 text-left" onClick={onToggle}>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
          {applicant?.fullName?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{applicant?.fullName || "Unknown"}</p>
            <StatusBadge status={app.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Mail size={10} />{applicant?.email}</span>
            {applicant?.location && <span className="flex items-center gap-1"><MapPin size={10} />{applicant.location}</span>}
            <span className="flex items-center gap-1"><Clock size={10} />{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {applicant?.skills?.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {applicant.skills.slice(0, 3).map((s) => (
                <span key={s} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          )}
          {isExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5 bg-gray-50">
          {applicant?.bio && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{applicant.bio}</p>
            </div>
          )}

          {applicant?.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.skills.map((s) => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {applicant?.education?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Education</p>
              {applicant.education.map((e, i) => (
                <p key={i} className="text-sm text-gray-700"><span className="font-medium">{e.degree}</span> · {e.institution} · {e.year}</p>
              ))}
            </div>
          )}

          {app.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Cover Letter</p>
              <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-xl p-4 leading-relaxed">{app.coverLetter}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {(app.resume?.path || applicant?.resume?.path) && (
                <a href={resumeUrl(app.resume?.path || applicant?.resume?.path)} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <Download size={12} /> Download Resume
                </a>
              )}
              {applicant?.phone && (
                <a href={`tel:${applicant.phone}`} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  <Phone size={11} />{applicant.phone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500 capitalize">
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <Button size="sm" onClick={() => onStatusChange(app._id, newStatus)} isLoading={isUpdating} disabled={newStatus === app.status}>
                <CheckCircle2 size={13} /> Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicantsPage;
