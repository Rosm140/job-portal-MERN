import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Search, MapPin, Briefcase, TrendingUp, Users,
  Star, ArrowRight, Sparkles, BookOpen, Building2,
  ChevronRight, Zap, Shield, Clock,
} from "lucide-react";

const TRENDING_SKILLS = [
  "React.js", "Node.js", "Python", "Data Science", "UI/UX Design",
  "DevOps", "Machine Learning", "Flutter", "Java", "AWS",
];

const CATEGORIES = [
  { icon: "💻", label: "Software Dev", count: "12,400+" },
  { icon: "📊", label: "Data Science", count: "4,200+" },
  { icon: "🎨", label: "Design", count: "3,800+" },
  { icon: "📱", label: "Mobile Dev", count: "2,900+" },
  { icon: "☁️", label: "Cloud / DevOps", count: "3,100+" },
  { icon: "🤖", label: "AI / ML", count: "2,600+" },
  { icon: "📈", label: "Marketing", count: "5,400+" },
  { icon: "🏦", label: "Finance", count: "3,200+" },
];

const TOP_COMPANIES = [
  "Google", "Microsoft", "Amazon", "Flipkart", "Infosys",
  "TCS", "Wipro", "Zomato", "Swiggy", "Razorpay",
];

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles size={14} className="text-yellow-300" />
            Now with AI-powered job matching & resume analysis
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            Find Your <span className="text-yellow-300">Dream Job</span><br />
            Faster with AI
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Over 50,000 jobs from top companies. AI-powered matching, resume analysis, and interview prep — all in one place.
          </p>

          {/* Search Box (Naukri style) */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 shadow-2xl max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, keywords, company..."
                  className="flex-1 text-gray-800 text-sm py-2 focus:outline-none"
                />
              </div>
              <div className="hidden sm:block w-px bg-gray-200" />
              <div className="flex-1 flex items-center gap-2 px-3">
                <MapPin size={18} className="text-gray-400 shrink-0" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, state, or remote"
                  className="flex-1 text-gray-800 text-sm py-2 focus:outline-none"
                />
              </div>
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
                Search Jobs
              </button>
            </div>

            {/* Trending Skills */}
            <div className="flex flex-wrap gap-2 mt-3 px-1">
              <span className="text-xs text-gray-400">Trending:</span>
              {TRENDING_SKILLS.slice(0, 6).map((skill) => (
                <button key={skill} type="button"
                  onClick={() => { setSearch(skill); }}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  {skill}
                </button>
              ))}
            </div>
          </form>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-center">
            {[["50,000+", "Active Jobs"], ["10,000+", "Companies"], ["2M+", "Job Seekers"], ["95%", "Placement Rate"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-yellow-300">{v}</p>
                <p className="text-blue-200 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Banner ─────────────────────────────────────────────── */}
      {isAuthenticated && !isAdmin && (
        <section className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-4 px-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-yellow-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">Your AI Career Assistant is ready!</p>
                <p className="text-violet-200 text-xs">Analyze resume, generate cover letters, prep for interviews</p>
              </div>
            </div>
            <Link to="/student/ai-tools"
              className="shrink-0 flex items-center gap-2 bg-white text-violet-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors">
              Try AI Tools <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── Browse by Category ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
          <Link to="/jobs" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            All categories <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(({ icon, label, count }) => (
            <Link key={label} to={`/jobs?search=${encodeURIComponent(label)}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-card-hover transition-all group cursor-pointer">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{label}</p>
              <p className="text-[10px] text-gray-400 mt-1">{count} jobs</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Why job seekers love JobPortal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Sparkles size={22} className="text-violet-600" />, bg: "bg-violet-50", title: "AI-Powered Matching", desc: "Our AI scores your profile against every job and tells you exactly why you're a fit." },
              { icon: <Zap size={22} className="text-blue-600" />, bg: "bg-blue-50", title: "One-Click Apply", desc: "Apply to any job in seconds using your saved profile. No re-entering details." },
              { icon: <Shield size={22} className="text-green-600" />, bg: "bg-green-50", title: "Verified Companies", desc: "Every employer is manually verified. No fake job postings, ever." },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-card transition-all">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Companies ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Top Hiring Companies</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {TOP_COMPANIES.map((company) => (
            <Link key={company} to={`/jobs?search=${encodeURIComponent(company)}`}
              className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-blue-300 rounded-xl px-5 py-3 transition-all hover:shadow-card group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {company[0]}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{company}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="bg-blue-600 text-white py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to land your dream job?</h2>
            <p className="text-blue-100 mb-8">Join 2 million+ professionals. Free forever for job seekers.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                Create Free Account
              </Link>
              <Link to="/register?role=admin" className="border border-white/40 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
                Post Jobs as Employer
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Briefcase size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Job<span className="text-blue-600">Portal</span></span>
          </div>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/jobs" className="hover:text-blue-600">Find Jobs</Link>
            <Link to="/register?role=admin" className="hover:text-blue-600">For Employers</Link>
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
          </div>
          <p className="text-xs text-gray-400">© 2025 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
