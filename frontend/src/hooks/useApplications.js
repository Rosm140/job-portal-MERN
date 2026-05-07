import { useState, useEffect, useCallback } from "react";
import { applicationsAPI } from "../api/applicationsAPI";
import toast from "react-hot-toast";
export const useMyApplications = (params = {}) => {
  const [applications, setApplications] = useState([]); const [pagination, setPagination] = useState(null); const [isLoading, setIsLoading] = useState(false);
  const fetchApplications = useCallback(async () => { setIsLoading(true); try { const r = await applicationsAPI.getMyApplications(params); setApplications(r.data.applications); setPagination(r.data.pagination); } catch { toast.error("Failed to fetch."); } finally { setIsLoading(false); } }, [JSON.stringify(params)]);
  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  const withdraw = async (id) => { try { await applicationsAPI.withdraw(id); toast.success("Withdrawn."); setApplications((p) => p.map((a) => a._id === id ? { ...a, status: "withdrawn" } : a)); } catch (e) { toast.error(e.response?.data?.message || "Failed."); } };
  return { applications, pagination, isLoading, refetch: fetchApplications, withdraw };
};
export const useAdminStats = () => {
  const [stats, setStats] = useState(null); const [isLoading, setIsLoading] = useState(false);
  useEffect(() => { const f = async () => { setIsLoading(true); try { const r = await applicationsAPI.getAdminStats(); setStats(r.data.stats); } catch {} finally { setIsLoading(false); } }; f(); }, []);
  return { stats, isLoading };
};
