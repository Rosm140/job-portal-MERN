// ── Spinner ────────────────────────────────────────────────────────────
export const Spinner = ({ size = "md", className = "" }) => {
  const s = { sm: "w-4 h-4 border-2", md: "w-7 h-7 border-2", lg: "w-10 h-10 border-2" };
  return <div className={`${s[size]} border-blue-600 border-t-transparent rounded-full animate-spin ${className}`} />;
};

export const LoadingPage = ({ message = "Loading..." }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p className="text-gray-400 text-sm">{message}</p>
  </div>
);

// ── Input ───────────────────────────────────────────────────────────────
export const Input = ({ label, error, icon, className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-xs font-semibold text-gray-700">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        className={`w-full border rounded-lg py-2.5 text-sm text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 transition-all bg-white
          ${icon ? "pl-9 pr-4" : "px-3.5"}
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Textarea ─────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-xs font-semibold text-gray-700">{label}</label>}
    <textarea
      className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition-all resize-none bg-white
        ${error ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Select ──────────────────────────────────────────────────────────────
export const Select = ({ label, error, options = [], className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="block text-xs font-semibold text-gray-700">{label}</label>}
    <select
      className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900
        focus:outline-none focus:ring-2 transition-all bg-white
        ${error ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}`}
      {...props}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Button ──────────────────────────────────────────────────────────────
export const Button = ({
  children, variant = "primary", size = "md",
  isLoading = false, className = "", disabled, ...props
}) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm",
    danger:    "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost:     "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    success:   "bg-green-600 hover:bg-green-700 text-white shadow-sm",
    outline:   "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  };
  const sizes = {
    xs: "text-xs px-2.5 py-1.5",
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-2.5",
    lg: "text-sm px-6 py-3",
    xl: "text-base px-8 py-3.5",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

// ── StatusBadge ──────────────────────────────────────────────────────────
const BADGE = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewed:    "bg-blue-50 text-blue-700 border-blue-200",
  shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
  interviewed: "bg-orange-50 text-orange-700 border-orange-200",
  offered:     "bg-green-50 text-green-700 border-green-200",
  rejected:    "bg-red-50 text-red-600 border-red-200",
  withdrawn:   "bg-gray-100 text-gray-500 border-gray-200",
  active:      "bg-green-50 text-green-700 border-green-200",
  closed:      "bg-red-50 text-red-600 border-red-200",
  draft:       "bg-gray-100 text-gray-500 border-gray-200",
  "full-time": "bg-green-50 text-green-700 border-green-200",
  "part-time": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "contract":  "bg-orange-50 text-orange-700 border-orange-200",
  "internship":"bg-blue-50 text-blue-700 border-blue-200",
};
export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded border capitalize ${BADGE[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    {status}
  </span>
);

// ── EmptyState ───────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 text-gray-400">{icon}</div>
    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 text-sm max-w-xs mb-5">{description}</p>
    {action}
  </div>
);

// ── StatCard ─────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = "blue", trend }) => {
  const colors = {
    blue:   "bg-blue-50 border-blue-100 text-blue-600",
    green:  "bg-green-50 border-green-100 text-green-600",
    violet: "bg-violet-50 border-violet-100 text-violet-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>{icon}</div>
        {trend !== undefined && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{trend}%</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
};

// ── PageHeader ──────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", padding = true }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${padding ? "p-6" : ""} ${className}`}>
    {children}
  </div>
);
