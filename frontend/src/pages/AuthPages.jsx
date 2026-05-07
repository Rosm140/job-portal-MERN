import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input, Button } from "@/components/ui";
import { Mail, Lock, Briefcase, ArrowRight, Eye, EyeOff } from "lucide-react";

export const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    const result = await login(form.email, form.password);
    if (result.success) navigate(from || (result.user.role === "admin" ? "/admin/dashboard" : "/jobs"), { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Job<span className="text-blue-600">Portal</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-6">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} icon={<Mail size={14} />} />

            <div className="relative">
              <Input label="Password" type={showPwd ? "text" : "password"} placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password} icon={<Lock size={14} />} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-2">
              Sign In <ArrowRight size={15} />
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-1.5">Demo Accounts</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>Student: <strong>student@demo.com</strong> / password123</p>
              <p>Admin: <strong>admin@demo.com</strong> / password123</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    role: "student", companyName: "",
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName || form.fullName.length < 2) e.fullName = "Full name is required";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (form.role === "admin" && !form.companyName) e.companyName = "Company name required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    const result = await register(form);
    if (result.success) navigate(result.user.role === "admin" ? "/admin/dashboard" : "/jobs");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Job<span className="text-blue-600">Portal</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Start your journey. It's free!</p>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            {[{ val: "student", label: "Job Seeker" }, { val: "admin", label: "Employer" }].map(({ val, label }) => (
              <button key={val} type="button" onClick={() => setForm({ ...form, role: val })}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${form.role === val ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} />
            {form.role === "admin" && (
              <Input label="Company Name" placeholder="Acme Inc." value={form.companyName} onChange={set("companyName")} error={errors.companyName} />
            )}
            <div className="relative">
              <Input label="Password" type={showPwd ? "text" : "password"} placeholder="Min. 6 characters"
                value={form.password} onChange={set("password")} error={errors.password} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Input label="Confirm Password" type="password" placeholder="Re-enter password"
              value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
            <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-2">
              Create Account <ArrowRight size={15} />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
