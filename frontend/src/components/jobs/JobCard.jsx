import { Link } from "react-router-dom";
import { MapPin, Clock, Banknote, Users, Bookmark, ExternalLink, Wifi } from "lucide-react";

const JOB_TYPE_STYLES = {
  "full-time": "bg-green-500/10 text-green-400 border-green-500/20",
  "part-time": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "contract": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "internship": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "freelance": "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const LOCATION_ICONS = {
  remote: <Wifi size={12} />,
  hybrid: <MapPin size={12} />,
  onsite: <MapPin size={12} />,
};

const formatSalary = (salary) => {
  if (!salary || !salary.isVisible) return null;
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.max) return `Up to ${fmt(salary.max)}`;
  return null;
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const JobCard = ({ job, compact = false }) => {
  const salaryStr = formatSalary(job.salary);
  const initials = job.company?.name?.slice(0, 2).toUpperCase() || "CO";

  return (
    <div className="group relative bg-gray-900 border border-white/[0.07] rounded-2xl p-5 hover:border-blue-500/30 hover:bg-gray-900/80 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5">
      {/* Company logo placeholder */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs text-gray-500">{job.company?.name}</p>
            <h3 className="text-white font-semibold text-sm leading-tight mt-0.5 group-hover:text-blue-300 transition-colors line-clamp-1">
              {job.title}
            </h3>
          </div>
        </div>
        <button className="text-gray-600 hover:text-blue-400 transition-colors p-1 opacity-0 group-hover:opacity-100">
          <Bookmark size={15} />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${JOB_TYPE_STYLES[job.jobType] || "bg-gray-700/50 text-gray-400 border-gray-700"}`}>
          {job.jobType}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 capitalize">
          {LOCATION_ICONS[job.locationType]}
          {job.locationType}
        </span>
        {job.experienceLevel && (
          <span className="text-[11px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 capitalize">
            {job.experienceLevel}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-[10px] text-blue-300/70 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[10px] text-gray-500 px-2 py-0.5">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {job.location}
          </span>
          {salaryStr && (
            <span className="flex items-center gap-1 text-emerald-400/80">
              <Banknote size={10} />
              {salaryStr}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600">{timeAgo(job.createdAt)}</span>
          <Link
            to={`/jobs/${job._id}`}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            View <ExternalLink size={10} />
          </Link>
        </div>
      </div>

      {/* Applicants count */}
      {job.applicantsCount > 0 && (
        <div className="absolute top-4 right-12 flex items-center gap-1 text-[10px] text-gray-600">
          <Users size={9} />
          {job.applicantsCount}
        </div>
      )}
    </div>
  );
};

export default JobCard;
