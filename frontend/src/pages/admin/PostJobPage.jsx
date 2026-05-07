import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobsAPI } from "../api/jobsAPI";
import { useAuth } from "../context/AuthContext";
import { Input, Textarea, Select, Button } from "../components/ui";
import toast from "react-hot-toast";
import { X, Plus, Briefcase } from "lucide-react";

const EMPTY_FORM = {
  title: "", description: "", location: "",
  jobType: "full-time", locationType: "onsite",
  experienceLevel: "fresher", openings: 1,
  salary: { min: "", max: "", currency: "INR", period: "yearly", isVisible: true },
  skills: [], requirements: [], responsibilities: [],
  deadline: "", status: "active",
};

const PostJobPage = () => {
  const { id } = useParams(); // If id is present, we're editing
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
        setForm({
          ...EMPTY_FORM, ...j,
          salary: j.salary || EMPTY_FORM.salary,
          deadline: j.deadline ? j.deadline.slice(0, 10) : "",
        });
      });
    }
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setSalary = (key) => (e) => setForm({ ...form, salary: { ...form.salary, [key]: e.target.value } });

  const addTag = (key, value, setter) => {
    if (!value.trim()) return;
    setForm({ ...form, [key]: [...form[key], value.trim()] });
    setter("");
  };

  const removeTag = (key, index) => {
    setForm({ ...form, [key]: form[key].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      return toast.error("Please fill all required fields.");
    }
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await jobsAPI.update(id, form);
        toast.success("Job updated successfully!");
      } else {
        await jobsAPI.create(form);
        toast.success("Job posted successfully! 🚀");
      }
      navigate("/admin/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Briefcase size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{isEditing ? "Edit Job" : "Post a New Job"}</h1>
            <p className="text-gray-400 text-xs">{user?.companyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Basic Information">
            <Input label="Job Title *" placeholder="e.g. Frontend Developer" value={form.title} onChange={set("title")} required />
            <Textarea label="Job Description *" placeholder="Describe the role, team, and what you're building..." value={form.description} onChange={set("description")} rows={6} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location *" placeholder="e.g. Pune, Maharashtra" value={form.location} onChange={set("location")} required />
              <Input label="Openings" type="number" min="1" value={form.openings} onChange={set("openings")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Job Type"
                value={form.jobType}
                onChange={set("jobType")}
                options={[
                  { value: "full-time", label: "Full Time" },
                  { value: "part-time", label: "Part Time" },
                  { value: "contract", label: "Contract" },
                  { value: "internship", label: "Internship" },
                  { value: "freelance", label: "Freelance" },
                ]}
              />
              <Select
                label="Work Mode"
                value={form.locationType}
                onChange={set("locationType")}
                options={[
                  { value: "onsite", label: "On-site" },
                  { value: "remote", label: "Remote" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
              />
              <Select
                label="Experience Level"
                value={form.experienceLevel}
                onChange={set("experienceLevel")}
                options={[
                  { value: "fresher", label: "Fresher" },
                  { value: "junior", label: "Junior (1-2y)" },
                  { value: "mid", label: "Mid (3-5y)" },
                  { value: "senior", label: "Senior (5+y)" },
                  { value: "lead", label: "Lead" },
                ]}
              />
            </div>
          </FormSection>

          <FormSection title="Salary">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Salary (₹)" type="number" placeholder="e.g. 400000" value={form.salary.min} onChange={setSalary("min")} />
              <Input label="Max Salary (₹)" type="number" placeholder="e.g. 800000" value={form.salary.max} onChange={setSalary("max")} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.salary.isVisible}
                onChange={(e) => setForm({ ...form, salary: { ...form.salary, isVisible: e.target.checked } })}
                className="w-4 h-4 rounded border-white/20 bg-gray-800 text-blue-500"
              />
              <span className="text-xs text-gray-400">Show salary to applicants</span>
            </label>
          </FormSection>

          <FormSection title="Skills Required">
            <TagInput
              placeholder="Add a skill (e.g. React, Node.js)"
              value={skillInput}
              onChange={setSkillInput}
              onAdd={() => addTag("skills", skillInput, setSkillInput)}
              tags={form.skills}
              onRemove={(i) => removeTag("skills", i)}
            />
          </FormSection>

          <FormSection title="Requirements">
            <TagInput
              placeholder="Add a requirement"
              value={reqInput}
              onChange={setReqInput}
              onAdd={() => addTag("requirements", reqInput, setReqInput)}
              tags={form.requirements}
              onRemove={(i) => removeTag("requirements", i)}
              multiline
            />
          </FormSection>

          <FormSection title="Responsibilities">
            <TagInput
              placeholder="Add a responsibility"
              value={respInput}
              onChange={setRespInput}
              onAdd={() => addTag("responsibilities", respInput, setRespInput)}
              tags={form.responsibilities}
              onRemove={(i) => removeTag("responsibilities", i)}
              multiline
            />
          </FormSection>

          <FormSection title="Settings">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Application Deadline" type="date" value={form.deadline} onChange={set("deadline")} />
              <Select
                label="Job Status"
                value={form.status}
                onChange={set("status")}
                options={[
                  { value: "active", label: "Active (Accepting Applications)" },
                  { value: "draft", label: "Draft (Hidden)" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            </div>
          </FormSection>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/admin/jobs")}>
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting} className="flex-1">
              {isEditing ? "Save Changes" : "Post Job 🚀"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6 space-y-4">
    <h2 className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">{title}</h2>
    {children}
  </div>
);

const TagInput = ({ placeholder, value, onChange, onAdd, tags, onRemove, multiline }) => (
  <div>
    <div className="flex gap-2">
      {multiline ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
        />
      )}
      <button type="button" onClick={onAdd} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
        <Plus size={16} />
      </button>
    </div>
    {tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/15 px-2.5 py-1 rounded-lg">
            {tag}
            <button type="button" onClick={() => onRemove(i)} className="text-blue-400/60 hover:text-blue-300">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
);

export default PostJobPage;
