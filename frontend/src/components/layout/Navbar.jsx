import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase, Bell, User, LogOut, Menu, X,
  LayoutDashboard, FileText, PlusCircle, ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStudent, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg
        ${isActive(to)
          ? "text-blue-400 bg-blue-500/10"
          : "text-gray-300 hover:text-white hover:bg-white/5"
        } ${className}`}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Job<span className="text-blue-400">Portal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/jobs">Browse Jobs</NavLink>
            {isAuthenticated && isStudent && (
              <>
                <NavLink to="/student/applications">My Applications</NavLink>
                <NavLink to="/student/profile">Profile</NavLink>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin/dashboard">Dashboard</NavLink>
                <NavLink to="/admin/jobs">Manage Jobs</NavLink>
                <NavLink to="/admin/post-job">Post Job</NavLink>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-medium leading-none">{user?.fullName?.split(" ")[0]}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {isStudent && (
                      <>
                        <DropdownItem to="/student/profile" icon={<User size={14} />} label="My Profile" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem to="/student/applications" icon={<FileText size={14} />} label="Applications" onClick={() => setDropdownOpen(false)} />
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownItem to="/admin/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem to="/admin/post-job" icon={<PlusCircle size={14} />} label="Post a Job" onClick={() => setDropdownOpen(false)} />
                      </>
                    )}
                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                      >
                        <LogOut size={14} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950 border-t border-white/[0.06] px-4 py-4 space-y-1">
          <NavLink to="/jobs">Browse Jobs</NavLink>
          {isAuthenticated && isStudent && (
            <>
              <NavLink to="/student/applications">My Applications</NavLink>
              <NavLink to="/student/profile">Profile</NavLink>
            </>
          )}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink to="/admin/dashboard">Dashboard</NavLink>
              <NavLink to="/admin/jobs">Manage Jobs</NavLink>
              <NavLink to="/admin/post-job">Post Job</NavLink>
            </>
          )}
          {!isAuthenticated ? (
            <div className="pt-2 flex gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 border border-white/10 rounded-lg text-gray-300 text-sm">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-blue-600 rounded-lg text-white text-sm">Register</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-400 text-sm flex items-center gap-2">
              <LogOut size={14} /> Log out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

const DropdownItem = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
  >
    {icon}
    {label}
  </Link>
);

export default Navbar;
