import { useMyApplications } from "../../hooks/useApplications";
import { LoadingPage, EmptyState, StatusBadge, Button } from "../../components/ui";
import { Link } from "react-router-dom";
import { FileText, MapPin, Briefcase, Calendar, ChevronRight, AlertCircle } from "lucide-react";

const STATUS_STEPS = ["pending", "reviewed", "shortlisted", "interviewed", "offered"];

const ApplicationsPage = () => {
  const { applications, isLoading, withdraw } = useMyApplications();

  if (isLoading) return <LoadingPage message="Fetching your applications..." />;

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Applications</h1>
          <p className="text-gray-400 text-sm mt-1">
            {applications.length} application{applications.length !== 1 ? "s" : ""} submitted
          </p>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No applications yet"
            description="Start exploring jobs and apply to the ones that match your skills."
            action={
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            }
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

  const isActive = !["rejected", "withdrawn"].includes(app.status);
  const currentStep = STATUS_STEPS.indexOf(app.status);

  return (
    <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-5 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-sm">{job.title}</h3>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-gray-400 text-xs mt-1">{job.company?.name}</p>

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={10} /> {job.jobType}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isActive && app.status !== "offered" && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onWithdraw(app._id)}
            >
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

      {/* Progress Stepper (for active applications) */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                      ${i < currentStep ? "bg-blue-600 text-white" : i === currentStep ? "bg-blue-500 text-white ring-2 ring-blue-500/30" : "bg-gray-800 text-gray-600 border border-white/10"}`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span className={`text-[9px] mt-1 capitalize ${i <= currentStep ? "text-blue-400" : "text-gray-600"}`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 -translate-y-2 ${i < currentStep ? "bg-blue-600" : "bg-gray-800"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection / Offer notice */}
      {app.status === "rejected" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
          <AlertCircle size={12} />
          Your application was not selected. Keep applying!
        </div>
      )}
      {app.status === "offered" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
          🎉 Congratulations! You received an offer. Check your email.
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
