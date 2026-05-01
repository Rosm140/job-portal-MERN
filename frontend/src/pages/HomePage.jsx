import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Briefcase, Shield, Zap, Search, Users, TrendingUp } from "lucide-react";

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute top-40 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap size={11} className="fill-current" />
            Industry-level Job Portal — Built for India
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Find Your
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400"> Dream Career</span>
            </span>
            <br />with Confidence
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with top companies. Browse thousands of jobs. Apply in seconds.
            Your next opportunity is one click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? "/admin/dashboard" : "/jobs"}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-500/25 text-sm"
              >
                {isAdmin ? "Go to Dashboard" : "Browse Jobs"} <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-500/25 text-sm"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-medium px-8 py-4 rounded-2xl transition-all text-sm"
                >
                  <Search size={15} /> Browse Jobs
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-white/[0.06]">
            {[
              { value: "10,000+", label: "Active Jobs" },
              { value: "5,000+", label: "Companies" },
              { value: "50,000+", label: "Job Seekers" },
              { value: "98%", label: "Success Rate" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to land your next job</h2>
          <p className="text-gray-400 max-w-xl mx-auto">A complete platform for job seekers and employers to connect efficiently.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc, color }) => (
            <div key={title} className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6 hover:border-white/10 transition-all group">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 text-white`}>
                {icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="bg-gradient-to-br from-blue-600/20 via-blue-600/10 to-violet-600/20 border border-blue-500/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start your journey?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of professionals already using JobPortal to advance their careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/25">
                Create Free Account <ArrowRight size={15} />
              </Link>
              <Link to="/register?role=admin" className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4">
                Post jobs as Employer →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Briefcase size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Job<span className="text-blue-400">Portal</span></span>
          </div>
          <p className="text-xs text-gray-600">© 2025 JobPortal. Built with React + Node.js + MongoDB.</p>
        </div>
      </footer>
    </div>
  );
};

const FEATURES = [
  { icon: <Search size={18} />, title: "Smart Job Search", desc: "Filter by role, location, salary, skills, and work mode to find the perfect match.", color: "from-blue-500 to-blue-600" },
  { icon: <Shield size={18} />, title: "Secure Authentication", desc: "JWT-based login with role separation for students and admin users.", color: "from-violet-500 to-violet-600" },
  { icon: <Briefcase size={18} />, title: "Apply in Seconds", desc: "One-click apply using your saved profile resume with optional cover letter.", color: "from-emerald-500 to-emerald-600" },
  { icon: <TrendingUp size={18} />, title: "Track Applications", desc: "Real-time status updates from pending to shortlisted, interviewed, and offered.", color: "from-orange-500 to-orange-600" },
  { icon: <Users size={18} />, title: "Admin Dashboard", desc: "Full CMS for companies — post jobs, review applicants, update statuses.", color: "from-pink-500 to-pink-600" },
  { icon: <Zap size={18} />, title: "Resume Upload", desc: "Upload your resume once, use it across all applications instantly.", color: "from-yellow-500 to-yellow-600" },
];

export default HomePage;
