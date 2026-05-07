import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useJob } from "../../hooks/useJobs";
import { useAuth } from "../../context/AuthContext";
import { applicationsAPI } from "../../api/applicationsAPI";
import { LoadingPage, Button, Textarea, StatusBadge } from "../../components/ui";
import toast from "react-hot-toast";
import {
  MapPin, Briefcase, Banknote, Users, Globe, Wifi,
  CheckCircle2, ArrowLeft, Send, Upload, Building2,
  Clock, Bookmark, BookmarkCheck, Share2, Zap, Star,
  ChevronRight,
} from "lucide-react";

const calcMatchScore = (jobSkills = [], userSkills = []) => {
  if (!userSkills.length || !jobSkills.length) return null;
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const matched = jobSkills.filter((s) => userSet.has(s.toLowerCase()));
  return { score: Math.round((matched.length / jobSkills.length) * 100), matched };
};

const timeAgo = (date) => {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return "Posted today";
  if (d === 1) return "Posted yesterday";
  if (d < 7) return `Posted ${d} days ago`;
  return `Posted ${Math.floor(d / 7)} weeks ago`;
};

const JobDetailPage = () => {
  const { id } = useParams();
  const { job, hasApplied, isLoading } = useJob(id);
  const { isAuthenticated, isStudent, user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [bookmarked, setBookmarked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks") || "[]").includes(id); } catch { return false; }
  });

  if (isLoading) return <LoadingPage message="Loading job..." />;
  if (!job) return (
    <div className="min-h-screen bg-slate-50 pt-24 flex flex-col items-center justify-center">
      <p className="text-xl font-semibold text-gray-700">Job not found</p>
      <Link to="/jobs" className="text-blue-600 mt-2 text-sm hover:underline">← Back to jobs</Link>
    </div>
  );

  const matchData = calcMatchScore(job.skills, user?.skills);
  const salary = (() => {
    const s = job.salary;
    if (!s || !s.isVisible || (!s.min && !s.max)) return "Not disclosed";
    const f = (n) => `₹${(n / 100000).toFixed(1)}L`;
    if (s.min && s.max) return `${f(s.min)} – ${f(s.max)} / year`;
    return f(s.max || s.min) + " / year";
  })();

  const handleBookmark = () => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    const updated = bookmarked ? stored.filter((x) => x !== id) : [...stored, id];
    localStorage.setItem("bookmarks", JSON.stringify(updated));
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Removed from saved" : "Job saved!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsAPI.apply(job._id, { coverLetter, resume: resumeFile });
      toast.success("Application submitted! 🎉");
      setShowModal(false);
      navigate("/student/applications");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Link to="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 truncate">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left / Main ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
                  {job.company?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-gray-600 text-sm font-medium">{job.company?.name}</span>
                        {job.company?.website && (
                          <a href={job.company.website} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <Globe size={11} /> Website
                          </a>
                        )}
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={handleShare}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy link">
                        <Share2 size={15} />
                      </button>
                      {isStudent && (
                        <button onClick={handleBookmark}
                          className={`p-2 rounded-lg transition-colors ${bookmarked ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}>
                          {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Match Score */}
                  {matchData && (
                    <div className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border
                      ${matchData.score >= 70 ? "bg-green-50 text-green-700 border-green-200"
                        : matchData.score >= 40 ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-600 border-red-200"}`}>
                      <Zap size={11} className="fill-current" />
                      {matchData.score}% profile match
                      <span className="font-normal text-gray-400">({matchData.matched.length}/{job.skills.length} skills)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
                <MetaItem icon={<MapPin size={14} className="text-gray-400" />} label="Location" value={job.location} />
                <MetaItem icon={<Briefcase size={14} className="text-gray-400" />} label="Job Type" value={job.jobType} />
                <MetaItem icon={<Banknote size={14} className="text-gray-400" />} label="Salary" value={salary} highlight />
                <MetaItem icon={<Users size={14} className="text-gray-400" />} label="Openings" value={`${job.openings || 1} position${(job.openings || 1) > 1 ? "s" : ""}`} />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <StatusBadge status={job.jobType} />
                <StatusBadge status={job.locationType} />
                <StatusBadge status={job.experienceLevel} />
                {job.locationType === "remote" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                    <Wifi size={10} /> Remote OK
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <Section title="Job Description">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </Section>

            {job.requirements?.length > 0 && (
              <Section title="Requirements">
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 size={15} className="text-blue-500 mt-0.5 shrink-0" />
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
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* About Company */}
            {job.company?.description && (
              <Section title="About the Company">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-bold shrink-0">
                    {job.company.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{job.company.name}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{job.company.description}</p>
                  </div>
                </div>
              </Section>
            )}
          </div>

          {/* ── Right / Sidebar ──────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Apply Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Users size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">{job.applicantsCount || 0} applicants</span>
                {job.deadline && (
                  <>
                    <span className="text-gray-200">·</span>
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs text-red-500 font-medium">
                      Closes {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </>
                )}
              </div>

              {!isAuthenticated ? (
                <Button onClick={() => navigate("/login")} size="lg" className="w-full">
                  Login to Apply
                </Button>
              ) : isStudent ? (
                hasApplied ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    Application Submitted
                  </div>
                ) : job.status === "active" ? (
                  <Button onClick={() => setShowModal(true)} size="lg" className="w-full">
                    <Send size={15} /> Apply Now
                  </Button>
                ) : (
                  <p className="text-sm text-center text-gray-400 py-2">This job is no longer accepting applications.</p>
                )
              ) : null}

              {isStudent && !hasApplied && job.status === "active" && (
                <Button variant="secondary" size="md" className="w-full mt-2" onClick={handleBookmark}>
                  {bookmarked ? <><BookmarkCheck size={14} /> Saved</> : <><Bookmark size={14} /> Save for Later</>}
                </Button>
              )}
            </div>

            {/* Skills Match */}
            {job.skills?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => {
                    const isMatch = user?.skills?.some((s) => s.toLowerCase() === skill.toLowerCase());
                    return (
                      <span key={skill}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all
                          ${isMatch ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {isMatch && <CheckCircle2 size={10} className="inline mr-1" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
                {isStudent && (
                  <p className="text-xs text-gray-400 mt-3">
                    {matchData ? `You match ${matchData.matched.length} of ${job.skills.length} skills` : "Add skills to your profile to see match"}
                  </p>
                )}
              </div>
            )}

            {/* Job Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Job Summary</h3>
              <div className="space-y-3 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Published</span>
                  <span className="font-medium text-gray-700">{new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Job Type</span>
                  <span className="font-medium text-gray-700 capitalize">{job.jobType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience</span>
                  <span className="font-medium text-gray-700 capitalize">{job.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vacancies</span>
                  <span className="font-medium text-gray-700">{job.openings || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Apply for {job.title}</h2>
                <p className="text-sm text-gray-500">{job.company?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">✕</button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              {/* Resume section */}
              {user?.resume?.filename ? (
                <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">Resume on file</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.resume.originalName}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Upload Resume</label>
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {resumeFile ? resumeFile.name : "Click to upload PDF or DOC (max 5MB)"}
                    </span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => setResumeFile(e.target.files[0])} />
                  </label>
                </div>
              )}

              <Textarea
                label="Cover Letter (optional)"
                placeholder="Tell the employer why you're the perfect fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
              />

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1" isLoading={applying}>
                  <Send size={14} /> Submit Application
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
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
    {children}
  </div>
);

const MetaItem = ({ icon, label, value, highlight }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</span></div>
    <p className={`text-sm font-semibold capitalize ${highlight ? "text-green-700" : "text-gray-800"}`}>{value}</p>
  </div>
);

export default JobDetailPage;
