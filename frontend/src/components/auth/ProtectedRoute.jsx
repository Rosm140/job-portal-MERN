import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Must be logged in
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();
  if (!isInitialized) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// Redirect away if already logged in (login/register pages)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();
  if (!isInitialized) return null;
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin/dashboard" : "/jobs"} replace />;
  return children;
};

// Admin only
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();
  const location = useLocation();
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/jobs" replace />;
  return children;
};

// Student only
export const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent, isInitialized } = useAuth();
  const location = useLocation();
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isStudent) return <Navigate to="/admin/dashboard" replace />;
  return children;
};
