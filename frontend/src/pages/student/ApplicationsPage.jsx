import { useMyApplications } from "../../hooks/useApplications";
import { LoadingPage, EmptyState, StatusBadge, Button } from "../components/ui";
import { Link } from "react-router-dom";
import {
  FileText, MapPin, Briefcase, Calendar, ChevronRight,
  AlertCircle, CheckCircle2, Trophy, Clock,
} from "lucide-react";

const STATUS_STEPS = ["pending", "reviewed", "shortlisted", "interviewed", "offered"];

const STATUS_FILTERS = ["all", "pending", "shortlisted", "offered", "rejected"];

const ApplicationsPage = () => {
  const { applications, isLoading, withdraw } = useMyApplications();

  const total   = applications.length;
  const active  = applications.filter((a) => !["rejected","withdrawn"].includes(a.status)).length;
  const offered = applications.filter((a) => a.status === "offered").length;

  if (isLoading) return <LoadingPage message="Loading your applications..." />;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total · {active} active · {offered} offers</p>
        </div>

        {/* Quick Stats */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Applied", value: total, color: "bg-blue-50 border-blue-100 text-blue-700" },
              { label: "In Progress", value: active, color: "bg-yellow-50 border-yellow-100 text-yellow-700" },
              { label: "Offers", value: offered, color: "bg-green-50 border-green-100 text-green-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} border rounded-xl p-4 text-center`}>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs mt-0.5 opacity-80">{label}</p>
              </div>
            ))}
          </div>
        )}

        {applications.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No applications yet"
            description="Start browsing jobs and apply to opportunities that match your skills."
            action={<Link to="/jobs"><Button>Browse Jobs</Button></Link>}
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard key={app._id} app={app} onWithdraw={withdraw} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationCard = ({ app, onWithdraw }) => {
  const job = app.job;
  if (!job) return null;

  const isActive   = !["rejected", "withdrawn"].includes(app.status);
  const currentIdx = STATUS_STEPS.indexOf(app.status);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all">
      {/* Card Header */}
      <div className="flex items-start gap-4 p-5">
        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
          {job.company?.name?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-gray-500 text-xs mt-0.5 font-medium">{job.company?.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase size={10} className="capitalize" />{job.jobType}</span>
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isActive && app.status !== "offered" && (
            <Button variant="danger" size="sm" onClick={() => onWithdraw(app._id)}>
              Withdraw
            </Button>
          )}
          <Link to={`/jobs/${job._id}`}>
            <Button variant="secondary" size="sm">
              View <ChevronRight size={12} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Stepper (active applications) */}
      {isActive && (
        <div className="px-5 pb-5">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done    = i < currentIdx;
              const current = i === currentIdx;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${done    ? "bg-blue-600 text-white"
                        : current ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                      {done ? <CheckCircle2 size={13} /> : i + 1}
                    </div>
                    <span className={`text-[9px] mt-1.5 capitalize font-medium
                      ${current ? "text-blue-600" : done ? "text-gray-500" : "text-gray-300"}`}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1.5 -translate-y-2.5 rounded-full
                      ${i < currentIdx ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status banners */}
      {app.status === "offered" && (
        <div className="mx-5 mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <Trophy size={16} />
          Congratulations! You received an offer. Check your email for next steps.
        </div>
      )}
      {app.status === "rejected" && (
        <div className="mx-5 mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} />
          This application was not selected. Don't give up — keep applying!
        </div>
      )}
      {app.status === "withdrawn" && (
        <div className="mx-5 mb-5 flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm">
          <Clock size={15} />
          You withdrew this application.
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
