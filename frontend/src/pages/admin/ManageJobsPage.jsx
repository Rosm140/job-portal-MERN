import { useState } from "react";
import { Link } from "react-router-dom";
import { jobsAPI } from "../../api/jobsAPI";
import { useJobs } from "../../hooks/useJobs";
import { LoadingPage, EmptyState, StatusBadge, Button } from "../../components/ui";
import toast from "react-hot-toast";
import { Briefcase, PlusCircle, Edit2, Trash2, Eye, Users, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";

const ManageJobsPage = () => {
  const { jobs, pagination, isLoading, params, updateParams, refetch } = useJobs({ limit: 10 });
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job? All applications will also be removed.")) return;
    setDeletingId(id);
    try { await jobsAPI.delete(id); toast.success("Job deleted."); refetch(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (job) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    setTogglingId(job._id);
    try { await jobsAPI.toggleStatus(job._id, newStatus); toast.success(`Job marked as ${newStatus}.`); refetch(); }
    catch { toast.error("Failed to update status."); }
    finally { setTogglingId(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
            <p className="text-gray-500 text-sm mt-0.5">{pagination?.total || 0} jobs posted</p>
          </div>
          <Link to="/admin/post-job"><Button size="md"><PlusCircle size={15} /> Post New Job</Button></Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all", "active", "closed", "draft"].map((s) => (
            <button key={s} onClick={() => updateParams({ status: s === "all" ? undefined : s, page: 1 })}
              className={`text-xs px-4 py-2 rounded-xl border transition-all capitalize shrink-0
                ${(params.status === s || (!params.status && s === "all"))
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300 text-gray-600 hover:border-blue-300"}`}>
              {s}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingPage message="Loading your jobs..." /> : jobs.length === 0 ? (
          <EmptyState icon={<Briefcase size={28} />} title="No jobs found"
            description="Post your first job to start receiving applications."
            action={<Link to="/admin/post-job"><Button><PlusCircle size={14} /> Post a Job</Button></Link>} />
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Job Title</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1 text-center">Applicants</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Toggle</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <div key={job._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                    <div className="md:col-span-4">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{job.location} · {job.company?.name}</p>
                    </div>
                    <div className="md:col-span-2"><StatusBadge status={job.jobType} /></div>
                    <div className="md:col-span-1 flex items-center justify-start md:justify-center gap-1 text-sm text-gray-500">
                      <Users size={12} />{job.applicantsCount || 0}
                    </div>
                    <div className="md:col-span-2 flex justify-start md:justify-center"><StatusBadge status={job.status} /></div>
                    <div className="md:col-span-1 flex justify-start md:justify-center">
                      <button onClick={() => handleToggle(job)} disabled={togglingId === job._id || job.status === "draft"}
                        className="text-gray-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        {togglingId === job._id
                          ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          : job.status === "active"
                            ? <ToggleRight size={22} className="text-green-500" />
                            : <ToggleLeft size={22} />}
                      </button>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2">
                      <Link to={`/admin/jobs/${job._id}/applications`}>
                        <Button variant="secondary" size="sm"><Eye size={13} /><span className="hidden sm:inline">View</span></Button>
                      </Link>
                      <Link to={`/admin/post-job/${job._id}`}>
                        <Button variant="ghost" size="sm"><Edit2 size={13} /></Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(job._id)} isLoading={deletingId === job._id}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pagination?.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => updateParams({ page: params.page - 1 })} disabled={params.page <= 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed bg-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-500">Page <span className="font-semibold text-gray-800">{params.page}</span> of <span className="font-semibold text-gray-800">{pagination.pages}</span></span>
                <button onClick={() => updateParams({ page: params.page + 1 })} disabled={params.page >= pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed bg-white transition-colors">
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

export default ManageJobsPage;
