import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobsAPI } from "../../api/jobsAPI";
import { useAuth } from "../../context/AuthContext";
import { Input, Textarea, Select, Button } from "../../components/ui";
import toast from "react-hot-toast";
import { X, Plus, Briefcase, ArrowLeft } from "lucide-react";

const EMPTY_FORM = {
  title: "", description: "", location: "",
  jobType: "full-time", locationType: "onsite",
  experienceLevel: "fresher", openings: 1,
  salary: { min: "", max: "", currency: "INR", period: "yearly", isVisible: true },
  skills: [], requirements: [], responsibilities: [],
  deadline: "", status: "active",
};

const PostJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [respInput, setRespInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      jobsAPI.getById(id).then((res) => {
        const j = res.data.job;
        setForm({ ...EMPTY_FORM, ...j, salary: j.salary || EMPTY_FORM.salary, deadline: j.deadline ? j.deadline.slice(0, 10) : "" });
      }).catch(() => toast.error("Failed to load job."));
    }
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setSalary = (k) => (e) => setForm({ ...form, salary: { ...form.salary, [k]: e.target.value } });

  const addTag = (key, value, setter) => {
    if (!value.trim()) return;
    setForm({ ...form, [key]: [...form[key], value.trim()] });
    setter("");
  };
  const removeTag = (key, index) => setForm({ ...form, [key]: form[key].filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) return toast.error("Please fill all required fields.");
    setIsSubmitting(true);
    try {
      if (isEditing) { await jobsAPI.update(id, form); toast.success("Job updated!"); }
      else { await jobsAPI.create(form); toast.success("Job posted! 🚀"); }
      navigate("/admin/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/admin/jobs")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={18} /></button>
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center"><Briefcase size={18} className="text-blue-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Job" : "Post a New Job"}</h1>
            <p className="text-gray-400 text-xs">{user?.companyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSection title="Basic Information">
            <Input label="Job Title *" placeholder="e.g. Frontend Developer" value={form.title} onChange={set("title")} required />
            <Textarea label="Job Description *" placeholder="Describe the role, team, and what you're building..." value={form.description} onChange={set("description")} rows={6} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Location *" placeholder="e.g. Pune, Maharashtra" value={form.location} onChange={set("location")} required />
              <Input label="Number of Openings" type="number" min="1" value={form.openings} onChange={set("openings")} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Job Type" value={form.jobType} onChange={set("jobType")} options={[{value:"full-time",label:"Full Time"},{value:"part-time",label:"Part Time"},{value:"contract",label:"Contract"},{value:"internship",label:"Internship"},{value:"freelance",label:"Freelance"}]} />
              <Select label="Work Mode" value={form.locationType} onChange={set("locationType")} options={[{value:"onsite",label:"On-site"},{value:"remote",label:"Remote"},{value:"hybrid",label:"Hybrid"}]} />
              <Select label="Experience Level" value={form.experienceLevel} onChange={set("experienceLevel")} options={[{value:"fresher",label:"Fresher"},{value:"junior",label:"Junior (1-2y)"},{value:"mid",label:"Mid (3-5y)"},{value:"senior",label:"Senior (5+y)"},{value:"lead",label:"Lead"}]} />
            </div>
          </FormSection>

          <FormSection title="Salary Package">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Min Salary (₹/year)" type="number" placeholder="e.g. 400000" value={form.salary.min} onChange={setSalary("min")} />
              <Input label="Max Salary (₹/year)" type="number" placeholder="e.g. 800000" value={form.salary.max} onChange={setSalary("max")} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" checked={form.salary.isVisible}
                onChange={(e) => setForm({ ...form, salary: { ...form.salary, isVisible: e.target.checked } })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-xs text-gray-600 font-medium">Show salary to applicants</span>
            </label>
          </FormSection>

          <FormSection title="Required Skills">
            <TagInput placeholder="Type a skill and press Enter (e.g. React)" value={skillInput} onChange={setSkillInput} onAdd={() => addTag("skills", skillInput, setSkillInput)} tags={form.skills} onRemove={(i) => removeTag("skills", i)} />
          </FormSection>

          <FormSection title="Requirements">
            <TagInput placeholder="Add a requirement and press Enter" value={reqInput} onChange={setReqInput} onAdd={() => addTag("requirements", reqInput, setReqInput)} tags={form.requirements} onRemove={(i) => removeTag("requirements", i)} listStyle />
          </FormSection>

          <FormSection title="Responsibilities">
            <TagInput placeholder="Add a responsibility and press Enter" value={respInput} onChange={setRespInput} onAdd={() => addTag("responsibilities", respInput, setRespInput)} tags={form.responsibilities} onRemove={(i) => removeTag("responsibilities", i)} listStyle />
          </FormSection>

          <FormSection title="Job Settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Application Deadline" type="date" value={form.deadline} onChange={set("deadline")} />
              <Select label="Job Status" value={form.status} onChange={set("status")} options={[{value:"active",label:"Active — Accepting Applications"},{value:"draft",label:"Draft — Hidden"},{value:"closed",label:"Closed"}]} />
            </div>
          </FormSection>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/admin/jobs")}>Cancel</Button>
            <Button type="submit" size="lg" isLoading={isSubmitting} className="flex-1">{isEditing ? "Save Changes" : "Post Job 🚀"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
    <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">{title}</h2>
    {children}
  </div>
);

const TagInput = ({ placeholder, value, onChange, onAdd, tags, onRemove, listStyle = false }) => (
  <div>
    <div className="flex gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white" />
      <button type="button" onClick={onAdd} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"><Plus size={16} /></button>
    </div>
    {tags.length > 0 && (
      <div className={`mt-3 ${listStyle ? "space-y-1.5" : "flex flex-wrap gap-2"}`}>
        {tags.map((tag, i) => (
          <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 ${listStyle ? "w-full justify-between" : ""}`}>
            <span className="flex-1">{tag}</span>
            <button type="button" onClick={() => onRemove(i)} className="text-blue-400 hover:text-blue-700 transition-colors"><X size={11} /></button>
          </span>
        ))}
      </div>
    )}
    {tags.length === 0 && <p className="text-xs text-gray-400 mt-2">No items added yet.</p>}
  </div>
);

export default PostJobPage;
