import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useJob } from "../hooks/useJobs";
import { useAuth } from "../context/AuthContext";
import { applicationsAPI } from "../api/applicationsAPI";
import { LoadingPage, Button, Textarea, StatusBadge } from "../components/ui";
import toast from "react-hot-toast";
import {
  MapPin, Briefcase, Clock, Banknote, Users, Globe,
  CheckCircle2, ArrowLeft, Send, Upload, Wifi,
} from "lucide-react";

const JobDetailPage = () => {
  const { id } = useParams();
  const { job, hasApplied, isLoading } = useJob(id);
  const { isAuthenticated, isStudent, user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  if (isLoading) return <LoadingPage message="Loading job details..." />;
  if (!job) return (
    <div className="min-h-screen bg-gray-950 pt-24 flex flex-col items-center justify-center">
      <p className="text-white text-xl">Job not found.</p>
      <Link to="/jobs" className="text-blue-400 mt-2 text-sm">← Back to jobs</Link>
    </div>
  );

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsAPI.apply(job._id, { coverLetter, resume: resumeFile });
      toast.success("Application submitted! 🎉");
      setShowModal(false);
      navigate("/student/applications");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const salaryDisplay = () => {
    const s = job.salary;
    if (!s || !s.isVisible) return "Not disclosed";
    const fmt = (n) => `₹${(n / 100000).toFixed(1)}L`;
    if (s.min && s.max) return `${fmt(s.min)} – ${fmt(s.max)} / year`;
    return fmt(s.max || s.min);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {job.company?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-gray-400 text-sm">{job.company?.name}</span>
                    {job.company?.website && (
                      <a href={job.company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                        <Globe size={11} /> Website
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={job.jobType} />
                    <StatusBadge status={job.locationType} />
                    <StatusBadge status={job.experienceLevel} />
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/[0.06]">
                <InfoItem icon={<MapPin size={13} />} label="Location" value={job.location} />
                <InfoItem icon={<Briefcase size={13} />} label="Type" value={job.jobType} />
                <InfoItem icon={<Banknote size={13} />} label="Salary" value={salaryDisplay()} />
                <InfoItem icon={<Users size={13} />} label="Openings" value={job.openings || 1} />
              </div>
            </div>

            {/* Description */}
            <Section title="Job Description">
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </Section>

            {job.requirements?.length > 0 && (
              <Section title="Requirements">
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 size={14} className="text-blue-400 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.responsibilities?.length > 0 && (
              <Section title="Responsibilities">
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-5 sticky top-24">
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Applicants</p>
                <p className="text-2xl font-bold text-white">{job.applicantsCount || 0}</p>
              </div>

              {!isAuthenticated ? (
                <Button onClick={() => navigate("/login")} size="lg" className="w-full">
                  Login to Apply
                </Button>
              ) : isStudent ? (
                hasApplied ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Application Submitted
                  </div>
                ) : job.status === "active" ? (
                  <Button onClick={() => setShowModal(true)} size="lg" className="w-full">
                    <Send size={15} /> Apply Now
                  </Button>
                ) : (
                  <p className="text-sm text-center text-gray-500">This job is no longer active.</p>
                )
              ) : null}

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span key={s} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/10 px-2 py-0.5 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Apply for {job.title}</h2>
            <p className="text-sm text-gray-400 mb-5">{job.company?.name}</p>

            <form onSubmit={handleApply} className="space-y-4">
              {/* Resume info */}
              {user?.resume?.filename ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-emerald-400 font-medium">Resume on file</p>
                    <p className="text-xs text-gray-500">{user.resume.originalName}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Upload Resume (optional)</label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-dashed border-white/15 rounded-xl hover:border-blue-500/30 transition-colors">
                    <Upload size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {resumeFile ? resumeFile.name : "Click to upload PDF or DOC (max 5MB)"}
                    </span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
                  </label>
                </div>
              )}

              <Textarea
                label="Cover Letter (optional)"
                placeholder="Tell the employer why you're a great fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" isLoading={applying}>
                  <Send size={15} /> Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6">
    <h2 className="text-base font-semibold text-white mb-4">{title}</h2>
    {children}
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
      {icon}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-white text-sm font-medium capitalize">{value}</p>
  </div>
);

export default JobDetailPage;
