import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase, Search, Bell, ChevronDown, Menu, X,
  User, FileText, LayoutDashboard, PlusCircle,
  LogOut, Settings, BookMarked, Sparkles,
} from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStudent, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const NavLink = ({ to, children }) => (
    <Link to={to}
      className={`text-sm font-medium px-1 py-4 border-b-2 transition-colors
        ${isActive(to)
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"}`}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">
              Job<span className="text-blue-600">Portal</span>
            </span>
          </Link>

          {/* Search bar (Naukri style) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <div className="flex items-center gap-2 px-3 border-r border-gray-200 bg-gray-50">
                <Search size={15} className="text-gray-400" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 text-sm font-medium transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-5">
            <NavLink to="/jobs">Jobs</NavLink>
            {isStudent && (
              <>
                <NavLink to="/student/applications">Applications</NavLink>
                <NavLink to="/student/ai-tools">AI Tools</NavLink>
              </>
            )}
            {isAdmin && (
              <>
                <NavLink to="/admin/dashboard">Dashboard</NavLink>
                <NavLink to="/admin/jobs">Jobs</NavLink>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors">
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin/post-job"
                    className="hidden md:flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <PlusCircle size={14} /> Post Job
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.fullName?.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform hidden md:block ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                        </div>

                        {isStudent && (
                          <>
                            <MenuItem to="/student/profile" icon={<User size={14} />} label="My Profile" onClick={() => setDropdownOpen(false)} />
                            <MenuItem to="/student/applications" icon={<FileText size={14} />} label="Applications" onClick={() => setDropdownOpen(false)} />
                            <MenuItem to="/student/bookmarks" icon={<BookMarked size={14} />} label="Saved Jobs" onClick={() => setDropdownOpen(false)} />
                            <MenuItem to="/student/ai-tools" icon={<Sparkles size={14} />} label="AI Tools" onClick={() => setDropdownOpen(false)} badge="New" />
                          </>
                        )}
                        {isAdmin && (
                          <>
                            <MenuItem to="/admin/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                            <MenuItem to="/admin/post-job" icon={<PlusCircle size={14} />} label="Post a Job" onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={14} /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <MobileLink to="/jobs" onClick={() => setMobileOpen(false)}>Browse Jobs</MobileLink>
          {isStudent && (
            <>
              <MobileLink to="/student/applications" onClick={() => setMobileOpen(false)}>My Applications</MobileLink>
              <MobileLink to="/student/ai-tools" onClick={() => setMobileOpen(false)}>✨ AI Tools</MobileLink>
              <MobileLink to="/student/profile" onClick={() => setMobileOpen(false)}>My Profile</MobileLink>
            </>
          )}
          {isAdmin && (
            <>
              <MobileLink to="/admin/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/admin/post-job" onClick={() => setMobileOpen(false)}>Post Job</MobileLink>
            </>
          )}
          {!isAuthenticated && (
            <div className="pt-2 flex gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const MenuItem = ({ to, icon, label, onClick, badge }) => (
  <Link to={to} onClick={onClick}
    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
    <span className="text-gray-400">{icon}</span>
    {label}
    {badge && <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{badge}</span>}
  </Link>
);

const MobileLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">{children}</Link>
);

export default Navbar;
