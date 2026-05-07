import { useState } from "react";
import { Link } from "react-router-dom";
import { jobsAPI } from "@/api/jobsAPI";
import { useJobs } from "@/hooks/useJobs";
import { LoadingPage, EmptyState, StatusBadge, Button } from "@/components/ui";
import toast from "react-hot-toast";
import {
  Briefcase, PlusCircle, Edit2, Trash2, Eye,
  Users, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight,
} from "lucide-react";

const ManageJobsPage = () => {
  const { jobs, pagination, isLoading, params, updateParams, refetch } = useJobs({ limit: 10 });
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job? All applications will also be removed.")) return;
    setDeletingId(id);
    try {
      await jobsAPI.delete(id);
      toast.success("Job deleted.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    setTogglingId(job._id);
    try {
      await jobsAPI.toggleStatus(job._id, newStatus);
      toast.success(`Job marked as ${newStatus}.`);
      refetch();
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Jobs</h1>
            <p className="text-gray-400 text-sm mt-0.5">{pagination?.total || 0} jobs posted</p>
          </div>
          <Link to="/admin/post-job">
            <Button size="md"><PlusCircle size={15} /> Post New Job</Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all", "active", "closed", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => updateParams({ status: s === "all" ? undefined : s, page: 1 })}
              className={`text-xs px-4 py-2 rounded-xl border transition-all capitalize shrink-0
                ${(params.status === s || (!params.status && s === "all"))
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingPage message="Loading your jobs..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={28} />}
            title="No jobs found"
            description="Post your first job to start receiving applications."
            action={<Link to="/admin/post-job"><Button><PlusCircle size={14} /> Post a Job</Button></Link>}
          />
        ) : (
          <>
            <div className="bg-gray-900 border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white/[0.02] border-b border-white/[0.06] text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Job Title</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1 text-center">Applicants</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Active</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {jobs.map((job) => (
                  <JobRow key={job._id} job={job} onDelete={handleDelete} onToggle={handleToggleStatus}
                    isDeleting={deletingId === job._id} isToggling={togglingId === job._id} />
                ))}
              </div>
            </div>
            {pagination?.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => updateParams({ page: params.page - 1 })} disabled={params.page <= 1}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-400">Page <span className="text-white">{params.page}</span> of <span className="text-white">{pagination.pages}</span></span>
                <button onClick={() => updateParams({ page: params.page + 1 })} disabled={params.page >= pagination.pages}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const JobRow = ({ job, onDelete, onToggle, isDeleting, isToggling }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors items-center">
    <div className="md:col-span-4">
      <p className="text-white text-sm font-medium">{job.title}</p>
      <p className="text-gray-500 text-xs mt-0.5">{job.location} · {job.company?.name}</p>
    </div>
    <div className="md:col-span-2"><StatusBadge status={job.jobType} /></div>
    <div className="md:col-span-1 flex items-center justify-start md:justify-center gap-1 text-sm text-gray-400">
      <Users size={12} />{job.applicantsCount || 0}
    </div>
    <div className="md:col-span-2 flex justify-start md:justify-center"><StatusBadge status={job.status} /></div>
    <div className="md:col-span-1 flex justify-start md:justify-center">
      <button onClick={() => onToggle(job)} disabled={isToggling || job.status === "draft"}
        className="text-gray-500 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        {isToggling ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          : job.status === "active" ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
      </button>
    </div>
    <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2">
      <Link to={`/admin/jobs/${job._id}/applications`}>
        <Button variant="secondary" size="sm"><Eye size={13} /><span className="hidden sm:inline">View</span></Button>
      </Link>
      <Link to={`/admin/post-job/${job._id}`}>
        <Button variant="ghost" size="sm"><Edit2 size={13} /></Button>
      </Link>
      <Button variant="danger" size="sm" onClick={() => onDelete(job._id)} isLoading={isDeleting}>
        <Trash2 size={13} />
      </Button>
    </div>
  </div>
);

export default ManageJobsPage;
