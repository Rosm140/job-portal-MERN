import { useState, useEffect, useCallback } from "react";
import { jobsAPI } from "../api/jobsAPI";
import toast from "react-hot-toast";

export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, ...initialParams });

  const fetchJobs = useCallback(async (queryParams = params) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await jobsAPI.getAll(queryParams);
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch jobs.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchJobs(params);
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({ page: 1, limit: 12 });
  }, []);

  return { jobs, pagination, isLoading, error, params, updateParams, resetFilters, refetch: fetchJobs };
};

export const useJob = (id) => {
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await jobsAPI.getById(id);
        setJob(res.data.job);
        setHasApplied(res.data.hasApplied);
      } catch (err) {
        toast.error("Job not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  return { job, hasApplied, isLoading };
};
