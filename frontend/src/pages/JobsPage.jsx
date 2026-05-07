import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import JobCard from "@/components/jobs/JobCard";
import { LoadingPage, EmptyState, Button } from "@/components/ui";
import { Briefcase, ChevronLeft, ChevronRight, SlidersHorizontal, X, Search, MapPin } from "lucide-react";
import { applicationsAPI } from "@/api/applicationsAPI";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const JOB_TYPES   = ["full-time", "part-time", "contract", "internship", "freelance"];
const LOC_TYPES   = ["onsite", "remote", "hybrid"];
const EXP_LEVELS  = ["fresher", "junior", "mid", "senior", "lead"];

const JobsPage = () => {
  const [searchParams] = useSearchParams();
  const { isStudent } = useAuth();
  const { jobs, pagination, isLoading, params, updateParams, resetFilters } = useJobs({
    search: searchParams.get("search") || undefined,
    location: searchParams.get("location") || undefined,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickApplyJobId, setQuickApplyJobId] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; }
  });

  // Local state for inputs to ensure they clear when resetFilters is called
  const [localSearch, setLocalSearch] = useState(params.search || "");
  const [localLocation, setLocalLocation] = useState(params.location || "");

  useEffect(() => {
    setLocalSearch(params.search || "");
    setLocalLocation(params.location || "");
  }, [params.search, params.location]);

  const handleBookmark = (jobId, saved) => {
    const updated = saved ? [...bookmarks, jobId] : bookmarks.filter((id) => id !== jobId);
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
    toast.success(saved ? "Job saved!" : "Removed from saved");
  };

  const handleQuickApply = async (jobId) => {
    setQuickApplyJobId(jobId);
    try {
      await applicationsAPI.apply(jobId, {});
      toast.success("Applied successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply.");
    } finally {
      setQuickApplyJobId(null);
    }
  };

  const hasFilters = params.jobType || params.locationType || params.experienceLevel || params.search;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          {/* Inline search */}
          <div className="flex flex-1 max-w-xl border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              value={localSearch}
              placeholder="Job title, skills..."
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateParams({ search: localSearch, page: 1 }); }}
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
            <div className="flex items-center gap-2 px-3 bg-gray-50 border-l border-gray-200">
              <MapPin size={14} className="text-gray-400" />
            </div>
            <input
              value={localLocation}
              placeholder="Location"
              onChange={(e) => setLocalLocation(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateParams({ location: localLocation, page: 1 }); }}
              className="w-32 px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all
                ${hasFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"}`}>
              <SlidersHorizontal size={14} /> Filters
              {hasFilters && <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {[params.jobType, params.locationType, params.experienceLevel].filter(Boolean).length}
              </span>}
            </button>
            {hasFilters && (
              <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2">
                <X size={12} /> Clear
              </button>
            )}
            <span className="text-sm text-gray-500">{pagination?.total || 0} jobs</span>
          </div>
        </div>

        {/* Expandable filter bar */}
        {filtersOpen && (
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4">
            <FilterGroup label="Job Type" options={JOB_TYPES} value={params.jobType}
              onChange={(v) => updateParams({ jobType: v === params.jobType ? undefined : v, page: 1 })} />
            <FilterGroup label="Work Mode" options={LOC_TYPES} value={params.locationType}
              onChange={(v) => updateParams({ locationType: v === params.locationType ? undefined : v, page: 1 })} />
            <FilterGroup label="Experience" options={EXP_LEVELS} value={params.experienceLevel}
              onChange={(v) => updateParams({ experienceLevel: v === params.experienceLevel ? undefined : v, page: 1 })} />
            <div className="flex items-end">
              <select value={params.sortBy || "createdAt"} onChange={(e) => updateParams({ sortBy: e.target.value })}
                className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none bg-white">
                <option value="createdAt">Newest first</option>
                <option value="salary">Highest salary</option>
                <option value="applicants">Most applied</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <LoadingPage message="Finding the best jobs for you..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={28} />}
            title="No jobs found"
            description="Try different keywords or remove some filters."
            action={<Button onClick={resetFilters} variant="outline">Clear Filters</Button>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isBookmarked={bookmarks.includes(job._id)}
                  onBookmark={handleBookmark}
                  onQuickApply={isStudent ? handleQuickApply : null}
                />
              ))}
            </div>

            {pagination?.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => updateParams({ page: params.page - 1 })} disabled={params.page <= 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors">
                  <ChevronLeft size={15} /> Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page} onClick={() => updateParams({ page })}
                        className={`w-9 h-9 text-sm rounded-lg border transition-colors
                          ${params.page === page ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => updateParams({ page: params.page + 1 })} disabled={params.page >= pagination.pages}
                  className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors">
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const FilterGroup = ({ label, options, value, onChange }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1 rounded-full border capitalize transition-all
            ${value === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-600 hover:border-blue-300"}`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default JobsPage;
