import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Banknote, Bookmark, BookmarkCheck, Zap, ExternalLink, Users, Wifi } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const JOB_TYPE_COLORS = {
  "full-time":  "bg-green-50 text-green-700 border-green-200",
  "part-time":  "bg-yellow-50 text-yellow-700 border-yellow-200",
  "contract":   "bg-orange-50 text-orange-700 border-orange-200",
  "internship": "bg-blue-50 text-blue-700 border-blue-200",
  "freelance":  "bg-purple-50 text-purple-700 border-purple-200",
};

const formatSalary = (s) => {
  if (!s || !s.isVisible || (!s.min && !s.max)) return null;
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (s.min && s.max) return `${fmt(s.min)} – ${fmt(s.max)}`;
  return s.max ? `Up to ${fmt(s.max)}` : fmt(s.min);
};

const timeAgo = (date) => {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1d ago";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

// Simple client-side match score based on skills overlap
const calcMatchScore = (jobSkills = [], userSkills = []) => {
  if (!userSkills.length || !jobSkills.length) return null;
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const matches = jobSkills.filter((s) => userSet.has(s.toLowerCase())).length;
  return Math.round((matches / jobSkills.length) * 100);
};

const MatchBadge = ({ score }) => {
  if (score === null) return null;
  const color = score >= 70 ? "bg-green-50 text-green-700 border-green-200"
    : score >= 40 ? "bg-yellow-50 text-yellow-700 border-yellow-200"
    : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${color}`}>
      <Zap size={9} className="fill-current" />
      {score}% match
    </span>
  );
};

const JobCard = ({ job, onBookmark, isBookmarked = false, onQuickApply }) => {
  const { user, isStudent } = useAuth();
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const matchScore = calcMatchScore(job.skills, user?.skills);
  const salary = formatSalary(job.salary);
  const initials = job.company?.name?.slice(0, 2).toUpperCase() || "CO";
  const isNew = (Date.now() - new Date(job.createdAt)) < 3 * 86400000;

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
    onBookmark?.(job._id, !bookmarked);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 job-card-hover relative group">
      {/* New badge */}
      {isNew && (
        <span className="absolute -top-2 left-4 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">NEW</span>
      )}

      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Company Logo */}
        <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{job.company?.name}</p>
            </div>
            {/* Bookmark */}
            {isStudent && (
              <button onClick={handleBookmark}
                className={`shrink-0 p-1 rounded transition-colors ${bookmarked ? "text-blue-600" : "text-gray-300 hover:text-gray-500"}`}>
                {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={11} />{job.location}
        </span>
        {job.locationType === "remote" && (
          <span className="flex items-center gap-1 text-blue-600"><Wifi size={11} />Remote</span>
        )}
        {salary && (
          <span className="flex items-center gap-1 text-green-700 font-medium">
            <Banknote size={11} />{salary}
          </span>
        )}
        <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(job.createdAt)}</span>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${JOB_TYPE_COLORS[job.jobType] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
          {job.jobType}
        </span>
        <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded capitalize">
          {job.experienceLevel}
        </span>
        {matchScore !== null && <MatchBadge score={matchScore} />}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[10px] text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Users size={10} /> {job.applicantsCount || 0} applicants
        </div>
        <div className="flex items-center gap-2">
          {isStudent && onQuickApply && (
            <button onClick={(e) => { e.preventDefault(); onQuickApply(job._id); }}
              className="text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              Quick Apply
            </button>
          )}
          <Link to={`/jobs/${job._id}`}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
            View <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
