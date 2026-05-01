import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Select } from "../components/ui";
import { User, Mail, Lock, Briefcase, Building2, ArrowRight } from "lucide-react";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    role: "student", companyName: "",
  });
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.fullName || form.fullName.length < 2) errs.fullName = "Full name is required";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Valid email is required";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (form.role === "admin" && !form.companyName) errs.companyName = "Company name is required for admin";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    const result = await register(form);
    if (result.success) {
      navigate(result.user.role === "admin" ? "/admin/dashboard" : "/jobs");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 pt-16 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Briefcase size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join thousands finding their dream jobs</p>
        </div>

        <div className="bg-gray-900/80 border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800 rounded-xl">
              {["student", "admin"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`py-2 rounded-lg text-sm font-medium transition-all capitalize
                    ${form.role === role
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  {role === "student" ? "Job Seeker" : "Employer"}
                </button>
              ))}
            </div>

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.fullName}
              onChange={set("fullName")}
              error={errors.fullName}
              icon={<User size={14} />}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              icon={<Mail size={14} />}
            />

            {form.role === "admin" && (
              <Input
                label="Company Name"
                placeholder="Acme Inc."
                value={form.companyName}
                onChange={set("companyName")}
                error={errors.companyName}
                icon={<Building2 size={14} />}
              />
            )}

            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              icon={<Lock size={14} />}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              error={errors.confirmPassword}
              icon={<Lock size={14} />}
            />

            <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-2">
              Create Account <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
