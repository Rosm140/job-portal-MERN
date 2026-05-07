import { useState, useEffect, useCallback } from "react";
import { jobsAPI } from "@/api/jobsAPI";
export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]); const [pagination, setPagination] = useState(null); const [isLoading, setIsLoading] = useState(false); const [params, setParams] = useState({ page: 1, limit: 12, ...initialParams });
  const fetchJobs = useCallback(async (qp = params) => { setIsLoading(true); try { const r = await jobsAPI.getAll(qp); setJobs(r.data.jobs); setPagination(r.data.pagination); } catch {} finally { setIsLoading(false); } }, [JSON.stringify(params)]);
  useEffect(() => { fetchJobs(params); }, [JSON.stringify(params)]);
  const updateParams = useCallback((np) => setParams((p) => ({ ...p, ...np, page: np.page || 1 })), []);
  const resetFilters = useCallback(() => setParams({ page: 1, limit: 12 }), []);
  return { jobs, pagination, isLoading, params, updateParams, resetFilters, refetch: fetchJobs };
};
export const useJob = (id) => {
  const [job, setJob] = useState(null); const [hasApplied, setHasApplied] = useState(false); const [isLoading, setIsLoading] = useState(false);
  useEffect(() => { if (!id) return; const f = async () => { setIsLoading(true); try { const r = await jobsAPI.getById(id); setJob(r.data.job); setHasApplied(r.data.hasApplied); } catch {} finally { setIsLoading(false); } }; f(); }, [id]);
  return { job, hasApplied, isLoading };
};
