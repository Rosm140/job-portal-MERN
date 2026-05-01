import { useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const LOCATION_TYPES = ["onsite", "remote", "hybrid"];
const EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior", "lead"];

const JobFilters = ({ params, onUpdate, onReset }) => {
  const [search, setSearch] = useState(params.search || "");

  const handleSearch = (e) => {
    e.preventDefault();
    onUpdate({ search, page: 1 });
  };

  const toggle = (key, value) => {
    const current = params[key];
    onUpdate({ [key]: current === value ? undefined : value, page: 1 });
  };

  const FilterChip = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize
        ${active
          ? "bg-blue-600 text-white border-blue-500"
          : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-200"
        }`}
    >
      {label}
    </button>
  );

  const hasFilters = params.jobType || params.locationType || params.experienceLevel || params.search;

  return (
    <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-400" />
          <h3 className="text-white font-semibold text-sm">Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <RotateCcw size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, skills..."
            className="w-full bg-gray-800 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); onUpdate({ search: undefined, page: 1 }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 rounded-lg transition-colors">
          Search
        </button>
      </form>

      {/* Job Type */}
      <FilterSection title="Job Type">
        <div className="flex flex-wrap gap-1.5">
          {JOB_TYPES.map((type) => (
            <FilterChip
              key={type}
              label={type}
              active={params.jobType === type}
              onClick={() => toggle("jobType", type)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Location Type */}
      <FilterSection title="Work Mode">
        <div className="flex flex-wrap gap-1.5">
          {LOCATION_TYPES.map((type) => (
            <FilterChip
              key={type}
              label={type}
              active={params.locationType === type}
              onClick={() => toggle("locationType", type)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience Level" last>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_LEVELS.map((level) => (
            <FilterChip
              key={level}
              label={level}
              active={params.experienceLevel === level}
              onClick={() => toggle("experienceLevel", level)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

const FilterSection = ({ title, children, last = false }) => (
  <div className={`${!last ? "mb-5 pb-5 border-b border-white/[0.06]" : ""}`}>
    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
    {children}
  </div>
);

export default JobFilters;
