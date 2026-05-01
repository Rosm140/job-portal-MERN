import { useAdminStats } from "../../hooks/useApplications";
import { useJobs } from "../../hooks/useJobs";
import { useAuth } from "../../context/AuthContext";
import { StatCard, LoadingPage } from "../../components/ui";
import { Link } from "react-router-dom";
import {
  Briefcase, Users, FileText, Clock, PlusCircle,
  TrendingUp, ArrowRight, Eye,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { jobs, isLoading: jobsLoading } = useJobs({ limit: 5 });

  if (statsLoading) return <LoadingPage message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.companyName && `Managing jobs for `}
            <span className="text-blue-400">{user?.companyName || "your company"}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Briefcase size={18} />}
            label="Total Jobs"
            value={stats?.totalJobs}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Active Jobs"
            value={stats?.activeJobs}
            color="emerald"
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Total Applications"
            value={stats?.totalApplications}
            color="violet"
          />
          <StatCard
            icon={<Clock size={18} />}
            label="Pending Review"
            value={stats?.pendingApplications}
            color="orange"
          />
          <StatCard
            icon={<Users size={18} />}
            label="Shortlisted"
            value={stats?.shortlisted}
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickAction
            icon={<PlusCircle size={20} />}
            title="Post New Job"
            description="Create a new job listing"
            to="/admin/post-job"
            color="blue"
          />
          <QuickAction
            icon={<Briefcase size={20} />}
            title="Manage Jobs"
            description="Edit or close your listings"
            to="/admin/jobs"
            color="violet"
          />
          <QuickAction
            icon={<Users size={20} />}
            title="View Applications"
            description="Review incoming applicants"
            to="/admin/jobs"
            color="emerald"
          />
        </div>

        {/* Recent Jobs */}
        <div className="bg-gray-900 border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold text-white text-sm">Recent Job Postings</h2>
            <Link to="/admin/jobs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {jobsLoading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No jobs posted yet.{" "}
                <Link to="/admin/post-job" className="text-blue-400">Post your first job →</Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{job.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{job.location} · {job.jobType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users size={11} /> {job.applicantsCount}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-lg border capitalize
                      ${job.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-gray-700/50 text-gray-400 border-gray-600"}`}>
                      {job.status}
                    </span>
                    <Link to={`/admin/jobs/${job._id}/applications`} className="text-gray-500 hover:text-blue-400 transition-colors">
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, title, description, to, color }) => {
  const colors = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/15 hover:border-blue-500/30 text-blue-400",
    violet: "from-violet-500/10 to-violet-600/5 border-violet-500/15 hover:border-violet-500/30 text-violet-400",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/15 hover:border-emerald-500/30 text-emerald-400",
  };
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 transition-all group`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-white font-medium text-sm group-hover:text-blue-100 transition-colors">{title}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
      <ArrowRight size={14} className="ml-auto text-gray-600 group-hover:text-current transition-colors" />
    </Link>
  );
};

export default AdminDashboard;
