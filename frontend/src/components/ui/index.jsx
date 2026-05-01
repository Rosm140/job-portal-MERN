// ── Spinner ────────────────────────────────────────────────────────────────────
export const Spinner = ({ size = "md", className = "" }) => {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };
  return (
    <div
      className={`${sizes[size]} border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

// ── LoadingPage ────────────────────────────────────────────────────────────────
export const LoadingPage = ({ message = "Loading..." }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

// ── Input ──────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, icon, className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-xs font-medium text-gray-300">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
      )}
      <input
        className={`w-full bg-gray-800/80 border rounded-xl py-2.5 text-sm text-white placeholder:text-gray-500
          focus:outline-none focus:ring-1 transition-all
          ${icon ? "pl-10 pr-4" : "px-4"}
          ${error
            ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
            : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
          }`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Textarea ───────────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-xs font-medium text-gray-300">{label}</label>}
    <textarea
      className={`w-full bg-gray-800/80 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500
        focus:outline-none focus:ring-1 transition-all resize-none
        ${error
          ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
          : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
        }`}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Select ─────────────────────────────────────────────────────────────────────
export const Select = ({ label, error, options = [], className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-xs font-medium text-gray-300">{label}</label>}
    <select
      className={`w-full bg-gray-800/80 border rounded-xl px-4 py-2.5 text-sm text-white
        focus:outline-none focus:ring-1 transition-all appearance-none
        ${error
          ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
          : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
        }`}
      {...props}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value} className="bg-gray-900">
          {label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Button ─────────────────────────────────────────────────────────────────────
export const Button = ({
  children, variant = "primary", size = "md", isLoading = false,
  className = "", disabled, ...props
}) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10",
    danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-sm px-6 py-3",
    xl: "text-base px-8 py-3.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

// ── Badge ──────────────────────────────────────────────────────────────────────
const STATUS_BADGE_STYLES = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shortlisted: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  interviewed: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  offered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  withdrawn: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-red-500/10 text-red-400 border-red-500/20",
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-lg border capitalize
      ${STATUS_BADGE_STYLES[status] || "bg-gray-700 text-gray-300 border-gray-600"}`}
  >
    {status}
  </span>
);

// ── EmptyState ─────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-600">
      {icon}
    </div>
    <h3 className="text-white font-medium mb-1">{title}</h3>
    <p className="text-gray-500 text-sm max-w-xs mb-4">{description}</p>
    {action}
  </div>
);

// ── StatCard ───────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, trend, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${colors[color].split(" ").pop()}`}>
          {icon}
        </div>
        {trend && <span className="text-xs text-emerald-400">+{trend}%</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
};
