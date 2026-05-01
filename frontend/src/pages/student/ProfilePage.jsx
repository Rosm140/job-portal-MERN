import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/userAPI";
import { Input, Textarea, Button } from "../../components/ui";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, MapPin, FileText, Upload,
  Trash2, CheckCircle2, Plus, X, Save, BookOpen, Briefcase,
} from "lucide-react";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "", phone: "", location: "", bio: "",
    skills: [], education: [], experience: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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

  const removeSkill = (i) => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) });

  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { degree: "", institution: "", year: "" }],
    });
  };

  const updateEducation = (i, key, val) => {
    const updated = form.education.map((e, idx) => idx === i ? { ...e, [key]: val } : e);
    setForm({ ...form, education: updated });
  };

  const removeEducation = (i) => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) });

  const addExperience = () => {
    setForm({
      ...form,
      experience: [...form.experience, { title: "", company: "", duration: "", description: "" }],
    });
  };

  const updateExperience = (i, key, val) => {
    const updated = form.experience.map((e, idx) => idx === i ? { ...e, [key]: val } : e);
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
      toast.error(err.response?.data?.message || "Failed to save profile.");
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
      e.target.value = "";
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Delete your resume?")) return;
    setIsDeletingResume(true);
    try {
      await userAPI.deleteResume();
      updateUser({ resume: null });
      toast.success("Resume deleted.");
    } catch (err) {
      toast.error("Failed to delete resume.");
    } finally {
      setIsDeletingResume(false);
    }
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: <User size={14} /> },
    { id: "resume", label: "Resume", icon: <FileText size={14} /> },
    { id: "education", label: "Education", icon: <BookOpen size={14} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.fullName}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-white/[0.07] rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all
                ${activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === "profile" && (
          <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white pb-3 border-b border-white/[0.06]">Personal Information</h2>
            <Input label="Full Name" value={form.fullName} onChange={set("fullName")} icon={<User size={14} />} />
            <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" icon={<Phone size={14} />} />
            <Input label="Location" value={form.location} onChange={set("location")} placeholder="Mumbai, Maharashtra" icon={<MapPin size={14} />} />
            <Textarea label="Bio / Summary" value={form.bio} onChange={set("bio")} placeholder="Brief introduction about yourself..." rows={4} />

            {/* Skills */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-300 mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g. React, Python)"
                  className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <button onClick={addSkill} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/15 px-2.5 py-1 rounded-lg">
                    {s}
                    <button onClick={() => removeSkill(i)} className="text-blue-400/60 hover:text-blue-300"><X size={10} /></button>
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} isLoading={isSaving} size="lg" className="w-full mt-2">
              <Save size={15} /> Save Profile
            </Button>
          </div>
        )}

        {/* Tab: Resume */}
        {activeTab === "resume" && (
          <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white pb-3 border-b border-white/[0.06] mb-5">Resume / CV</h2>

            {user?.resume?.filename ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-400 text-sm font-medium">Resume uploaded</p>
                    <p className="text-gray-400 text-xs truncate">{user.resume.originalName}</p>
                    <p className="text-gray-600 text-[11px] mt-0.5">
                      Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 cursor-pointer transition-all text-sm">
                      {isUploading ? <><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Replace Resume</>}
                    </div>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={isUploading} />
                  </label>
                  <Button variant="danger" onClick={handleDeleteResume} isLoading={isDeletingResume}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            ) : (
              <label className="block">
                <div className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/30 cursor-pointer transition-all group">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/15 rounded-xl flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                    {isUploading
                      ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      : <Upload size={20} className="text-blue-400" />}
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">{isUploading ? "Uploading..." : "Upload your Resume"}</p>
                    <p className="text-gray-500 text-xs mt-1">PDF or Word document · Max 5MB</p>
                  </div>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={isUploading} />
              </label>
            )}
          </div>
        )}

        {/* Tab: Education */}
        {activeTab === "education" && (
          <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Education</h2>
              <Button size="sm" variant="secondary" onClick={addEducation}>
                <Plus size={13} /> Add
              </Button>
            </div>
            {form.education.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">No education added yet.</p>
            )}
            {form.education.map((edu, i) => (
              <div key={i} className="p-4 bg-gray-800/50 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => removeEducation(i)} className="text-gray-500 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
                <Input label="Degree / Course" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="B.Tech Computer Science" />
                <Input label="Institution" value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="Mumbai University" />
                <Input label="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="2020 – 2024" />
              </div>
            ))}
            {form.education.length > 0 && (
              <Button onClick={handleSave} isLoading={isSaving} size="lg" className="w-full">
                <Save size={15} /> Save Education
              </Button>
            )}
          </div>
        )}

        {/* Tab: Experience */}
        {activeTab === "experience" && (
          <div className="bg-gray-900 border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Work Experience</h2>
              <Button size="sm" variant="secondary" onClick={addExperience}>
                <Plus size={13} /> Add
              </Button>
            </div>
            {form.experience.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">No experience added yet.</p>
            )}
            {form.experience.map((exp, i) => (
              <div key={i} className="p-4 bg-gray-800/50 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => removeExperience(i)} className="text-gray-500 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
                <Input label="Job Title" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} placeholder="Frontend Developer" />
                <Input label="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Acme Inc." />
                <Input label="Duration" value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} placeholder="Jan 2023 – Present" />
                <Textarea label="Description" value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="Describe your role and achievements..." rows={3} />
              </div>
            ))}
            {form.experience.length > 0 && (
              <Button onClick={handleSave} isLoading={isSaving} size="lg" className="w-full">
                <Save size={15} /> Save Experience
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
