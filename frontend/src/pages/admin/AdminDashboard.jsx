import { useAdminStats } from "@/hooks/useApplications";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/context/AuthContext";
import { StatCard, LoadingPage, Card } from "@/components/ui";
import { Link } from "react-router-dom";
import {
  Briefcase, Users, FileText, Clock, PlusCircle,
  TrendingUp, ArrowRight, Eye, BarChart2,
  CheckCircle2, AlertCircle, Zap,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { jobs, isLoading: jobsLoading } = useJobs({ limit: 6 });

  if (statsLoading) return <LoadingPage message="Loading dashboard..." />;

  const fillRate = stats?.totalJobs > 0
    ? Math.round((stats.shortlisted / (stats.totalApplications || 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Welcome back, {user?.fullName?.split(" ")[0]}! 👋</h1>
              <p className="text-blue-100 text-sm mt-1">{user?.companyName} · Admin Dashboard</p>
            </div>
            <Link to="/admin/post-job"
              className="hidden sm:flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              <PlusCircle size={16} /> Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Briefcase size={18} />}     label="Total Jobs"         value={stats?.totalJobs}         color="blue"   />
          <StatCard icon={<TrendingUp size={18} />}    label="Active Jobs"        value={stats?.activeJobs}        color="green"  />
          <StatCard icon={<FileText size={18} />}      label="Total Applications" value={stats?.totalApplications} color="violet" />
          <StatCard icon={<Clock size={18} />}         label="Pending Review"     value={stats?.pendingApplications} color="orange" />
          <StatCard icon={<Users size={18} />}         label="Shortlisted"        value={stats?.shortlisted}       color="green"  />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Application Pipeline */}
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} className="text-blue-600" />
              <h2 className="font-bold text-gray-900 text-sm">Application Pipeline</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Received", value: stats?.totalApplications || 0, color: "bg-blue-500", max: stats?.totalApplications || 1 },
                { label: "Under Review", value: stats?.pendingApplications || 0, color: "bg-yellow-400", max: stats?.totalApplications || 1 },
                { label: "Shortlisted", value: stats?.shortlisted || 0, color: "bg-green-500", max: stats?.totalApplications || 1 },
              ].map(({ label, value, color, max }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${Math.round((value / max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Shortlist Rate</span>
                <span className={`text-sm font-bold ${fillRate > 20 ? "text-green-600" : "text-yellow-600"}`}>{fillRate}%</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={16} className="text-violet-600" />
              <h2 className="font-bold text-gray-900 text-sm">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <PlusCircle size={20} className="text-blue-600" />,   title: "Post New Job",       desc: "Create a new listing",      to: "/admin/post-job",    bg: "bg-blue-50" },
                { icon: <Briefcase size={20} className="text-violet-600" />,  title: "Manage Jobs",        desc: "Edit your listings",        to: "/admin/jobs",        bg: "bg-violet-50" },
                { icon: <Users size={20} className="text-green-600" />,       title: "View Applicants",    desc: "Review candidates",         to: "/admin/jobs",        bg: "bg-green-50" },
                { icon: <BarChart2 size={20} className="text-orange-600" />,  title: "Analytics",          desc: "Track performance",         to: "/admin/dashboard",   bg: "bg-orange-50" },
              ].map(({ icon, title, desc, to, bg }) => (
                <Link key={title} to={to}
                  className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Jobs Table */}
        <Card padding={false}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Recent Job Postings</h2>
            <Link to="/admin/jobs" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {jobsLoading ? (
              <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">No jobs yet.</p>
                <Link to="/admin/post-job" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Post your first job →</Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                    {job.company?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{job.location} · {job.jobType}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={11} />{job.applicantsCount || 0}
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize
                      ${job.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {job.status}
                    </span>
                    <Link to={`/admin/jobs/${job._id}/applications`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
