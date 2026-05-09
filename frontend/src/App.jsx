import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import {
  ProtectedRoute, PublicRoute, AdminRoute, StudentRoute,
} from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";

// Pages
import HomePage      from "./pages/HomePage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import JobsPage      from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";

// Student pages
import ApplicationsPage   from "./pages/student/ApplicationsPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import AIToolsPage        from "./pages/student/AIToolsPage";
import BookmarksPage      from "./pages/student/BookmarksPage";

// Admin pages
import AdminDashboard    from "./pages/admin/AdminDashboard";
import ManageJobsPage    from "./pages/admin/ManageJobsPage";
import PostJobPage       from "./pages/admin/PostJobPage";
import JobApplicantsPage from "./pages/admin/JobApplicantsPage";

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-16 text-center px-4">
    <p className="text-8xl font-black text-gray-100 select-none">404</p>
    <h1 className="text-2xl font-bold text-gray-900 mb-2 -mt-4">Page Not Found</h1>
    <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-blue-600 hover:underline text-sm font-medium">← Back to Home</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Light-theme toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
          }}
        />

        <Navbar />

        <Routes>
          {/* ── Public ─────────────────────────────────────────────── */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/jobs"     element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* ── Auth (redirect if already logged in) ───────────────── */}
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* ── Student ────────────────────────────────────────────── */}
          <Route path="/student/applications"
            element={<StudentRoute><ApplicationsPage /></StudentRoute>} />
          <Route path="/student/profile"
            element={<StudentRoute><StudentProfilePage /></StudentRoute>} />
          <Route path="/student/ai-tools"
            element={<StudentRoute><AIToolsPage /></StudentRoute>} />
          <Route path="/student/bookmarks"
            element={<StudentRoute><BookmarksPage /></StudentRoute>} />

          {/* ── Admin ──────────────────────────────────────────────── */}
          <Route path="/admin/dashboard"
            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/jobs"
            element={<AdminRoute><ManageJobsPage /></AdminRoute>} />
          <Route path="/admin/post-job"
            element={<AdminRoute><PostJobPage /></AdminRoute>} />
          <Route path="/admin/post-job/:id"
            element={<AdminRoute><PostJobPage /></AdminRoute>} />
          <Route path="/admin/jobs/:jobId/applications"
            element={<AdminRoute><JobApplicantsPage /></AdminRoute>} />

          {/* ── 404 ────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
