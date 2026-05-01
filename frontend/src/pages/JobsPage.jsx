

// To this:
import { useAuth } from "../context/AuthContext";
import { Input, Button } from "../components/ui";
import { useJobs } from "../hooks/useJobs";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import { LoadingPage, EmptyState } from "../components/ui";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

const JobsPage = () => {
  const { jobs, pagination, isLoading, params, updateParams, resetFilters } = useJobs();

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/[0.06] py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Find Your <span className="text-blue-400">Next Opportunity</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {pagination?.total || 0} jobs available right now
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <JobFilters params={params} onUpdate={updateParams} onReset={resetFilters} />
            </div>
          </div>

          {/* Job Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters bar */}
            {(params.jobType || params.locationType || params.experienceLevel || params.search) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <span className="text-xs text-blue-400 font-medium">Active filters:</span>
                {params.search && <FilterTag label={`"${params.search}"`} onRemove={() => updateParams({ search: undefined })} />}
                {params.jobType && <FilterTag label={params.jobType} onRemove={() => updateParams({ jobType: undefined })} />}
                {params.locationType && <FilterTag label={params.locationType} onRemove={() => updateParams({ locationType: undefined })} />}
                {params.experienceLevel && <FilterTag label={params.experienceLevel} onRemove={() => updateParams({ experienceLevel: undefined })} />}
              </div>
            )}

            {isLoading ? (
              <LoadingPage message="Finding jobs for you..." />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase size={28} />}
                title="No jobs found"
                description="Try adjusting your filters or search query to find more opportunities."
                action={
                  <button onClick={resetFilters} className="text-sm text-blue-400 hover:text-blue-300">
                    Clear all filters
                  </button>
                }
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">
                    Showing <span className="text-white font-medium">{jobs.length}</span> of{" "}
                    <span className="text-white font-medium">{pagination?.total}</span> jobs
                  </p>
                  <select
                    value={params.sortBy || "createdAt"}
                    onChange={(e) => updateParams({ sortBy: e.target.value })}
                    className="text-xs bg-gray-800 border border-white/10 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="salary">Highest Salary</option>
                    <option value="applicants">Most Applied</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination?.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => updateParams({ page: params.page - 1 })}
                      disabled={params.page <= 1}
                      className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-400">
                      Page <span className="text-white">{params.page}</span> of{" "}
                      <span className="text-white">{pagination.pages}</span>
                    </span>
                    <button
                      onClick={() => updateParams({ page: params.page + 1 })}
                      disabled={params.page >= pagination.pages}
                      className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/20">
    {label}
    <button onClick={onRemove} className="hover:text-white ml-0.5">×</button>
  </span>
);

export default JobsPage;
