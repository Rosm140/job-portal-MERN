import { useState, useEffect, useCallback } from "react";
import { applicationsAPI } from "../api/applicationsAPI";
import toast from "react-hot-toast";

export const useMyApplications = (params = {}) => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [isLoading, setIsLoading]       = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await applicationsAPI.getMyApplications(params);
      setApplications(res.data.applications);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const withdraw = async (id) => {
    try {
      await applicationsAPI.withdraw(id);
      toast.success("Application withdrawn.");
      setApplications((prev) =>
        prev.map((a) => a._id === id ? { ...a, status: "withdrawn" } : a)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw.");
    }
  };

  return { applications, pagination, isLoading, refetch: fetchApplications, withdraw };
};

export const useAdminStats = () => {
  const [stats, setStats]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await applicationsAPI.getAdminStats();
        setStats(res.data.stats);
      } catch {}
      finally { setIsLoading(false); }
    };
    fetchStats();
  }, []);

  return { stats, isLoading };
};
