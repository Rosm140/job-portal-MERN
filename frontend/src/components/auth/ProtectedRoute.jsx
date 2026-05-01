import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Redirect to login if not authenticated
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Redirect if already logged in (for login/register pages)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();

  if (!isInitialized) return null;

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/jobs"} replace />;
  }

  return children;
};

// Only admins
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
};

// Only students
export const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStudent) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
