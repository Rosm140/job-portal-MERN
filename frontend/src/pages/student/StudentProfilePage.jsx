import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/userAPI";
import { Input, Textarea, Button } from "../../components/ui";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, MapPin, FileText, Upload,
  Trash2, Plus, X, Save, CheckCircle2,
} from "lucide-react";

const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "", phone: "", location: "", bio: "",
    skills: [], education: [], experience: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        skills: user.skills || [],
        education: user.education || [],
        experience: user.experience || [],
      });
    }
  }, [user]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const addSkill = () => {
    if (!skillInput.trim() || form.skills.includes(skillInput.trim())) return;
    setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
    setSkillInput("");
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });

  const addEducation = () => {
    setForm({ ...form, education: [...form.education, { degree: "", institution: "", year: "" }] });
  };

  const updateEducation = (i, key, value) => {
    const updated = form.education.map((e, idx) => idx === i ? { ...e, [key]: value } : e);
    setForm({ ...form, education: updated });
  };

  const removeEducation = (i) => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) });

  const addExperience = () => {
    setForm({ ...form, experience: [...form.experience, { title: "", company: "", duration: "", description: "" }] });
  };

  const updateExperience = (i, key, value) => {
    const updated = form.experience.map((e, idx) => idx === i ? { ...e, [key]: value } : e);
    setForm({ ...form, experience: updated });
  };

  const removeExperience = (i) => setForm({ ...form, experience: form.experience.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await userAPI.uploadResume(file);
      updateUser({ resume: res.data.resume });
      toast.success("Resume uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      await userAPI.deleteResume();
      updateUser({ resume: null });
      toast.success("Resume removed.");
    } catch {
      toast.error("Failed to delete resume.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-gray-400 text-sm mt-0.5">Keep your profile updated to attract employers</p>
          </div>
          <Button onClick={handleSave} isLoading={isSaving} size="md">
            <Save size={15} /> Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Section title="Personal Information" icon={<User size={15} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={form.fullName} onChange={set("fullName")} icon={<User size={13} />} />
              <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" icon={<Phone size={13} />} />
              <Input label="Location" value={form.location} onChange={set("location")} placeholder="City, State" icon={<MapPin size={13} />} className="sm:col-span-2" />
            </div>
            <Textarea
              label="Bio / Summary"
              value={form.bio}
              onChange={set("bio")}
              placeholder="Write a short summary about yourself, your skills, and career goals..."
              rows={4}
            />
          </Section>

          {/* Resume */}
          <Section title="Resume" icon={<FileText size={15} />}>
            {user?.resume?.filename ? (
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{user.resume.originalName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={handleDeleteResume}>
                  <Trash2 size={13} /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                <div className="w-12 h-12 bg-white/5 group-hover:bg-blue-500/10 rounded-xl flex items-center justify-center transition-colors">
                  {isUploading
                    ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    : <Upload size={20} className="text-gray-500 group-hover:text-blue-400 transition-colors" />}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300 font-medium">
                    {isUploading ? "Uploading..." : "Upload your resume"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">PDF or Word document, max 5MB</p>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={isUploading} />
              </label>
            )}
          </Section>

          {/* Skills */}
          <Section title="Skills" icon={<CheckCircle2 size={15} />}>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="Add a skill (e.g. React, Python)"
                className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <button
                type="button"
                onClick={addSkill}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/15 px-3 py-1 rounded-lg">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-blue-400/60 hover:text-blue-300"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Education */}
          <Section title="Education" icon={<FileText size={15} />}>
            <div className="space-y-3">
              {form.education.map((edu, i) => (
                <div key={i} className="relative bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <button onClick={() => removeEducation(i)} className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input placeholder="Degree / Course" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} />
                    <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} />
                    <Input placeholder="Year (e.g. 2024)" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addEducation}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
            >
              <Plus size={14} /> Add Education
            </button>
          </Section>

          {/* Experience */}
          <Section title="Work Experience" icon={<MapPin size={15} />}>
            <div className="space-y-3">
              {form.experience.map((exp, i) => (
                <div key={i} className="relative bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <button onClick={() => removeExperience(i)} className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} />
                    <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
                    <Input placeholder="Duration (e.g. Jan 2023 - Present)" value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} />
                  </div>
                  <Textarea placeholder="Brief description of your role..." value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={2} />
                </div>
              ))}
            </div>
            <button
              onClick={addExperience}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
            >
              <Plus size={14} /> Add Experience
            </button>
          </Section>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} isLoading={isSaving} size="lg">
              <Save size={15} /> Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6 space-y-4">
    <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
      <span className="text-blue-400">{icon}</span>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

export default StudentProfilePage;
