import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import {
  ProtectedRoute, PublicRoute,
  AdminRoute, StudentRoute,
} from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";

// Student Pages
import ApplicationsPage from "./pages/student/ApplicationsPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobsPage from "./pages/admin/ManageJobsPage";
import PostJobPage from "./pages/admin/PostJobPage";
import JobApplicantsPage from "./pages/admin/JobApplicantsPage";

// 404
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center pt-16 text-center px-4">
    <div className="text-8xl font-black text-white/5 mb-4">404</div>
    <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
    <p className="text-gray-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">← Back to Home</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "#34d399", secondary: "#1f2937" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#1f2937" } },
          }}
        />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Auth Routes (redirect if already logged in) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Student Routes */}
          <Route path="/student/applications" element={<StudentRoute><ApplicationsPage /></StudentRoute>} />
          <Route path="/student/profile" element={<StudentRoute><StudentProfilePage /></StudentRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/jobs" element={<AdminRoute><ManageJobsPage /></AdminRoute>} />
          <Route path="/admin/post-job" element={<AdminRoute><PostJobPage /></AdminRoute>} />
          <Route path="/admin/post-job/:id" element={<AdminRoute><PostJobPage /></AdminRoute>} />
          <Route path="/admin/jobs/:jobId/applications" element={<AdminRoute><JobApplicantsPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
