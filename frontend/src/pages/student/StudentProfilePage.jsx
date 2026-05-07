import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/userAPI";
import { Input, Textarea, Button, Card } from "../../components/ui";
import toast from "react-hot-toast";
import {
  User, Phone, MapPin, FileText, Upload, Trash2,
  Plus, X, Save, CheckCircle2, Sparkles, Edit3,
  GraduationCap, Briefcase, Star, AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// Profile completeness calculation
const calcCompleteness = (user) => {
  if (!user) return 0;
  const checks = [
    !!user.fullName,
    !!user.phone,
    !!user.location,
    !!user.bio,
    user.skills?.length > 0,
    user.education?.length > 0,
    user.experience?.length > 0,
    !!user.resume?.filename,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "", phone: "", location: "", bio: "",
    skills: [], education: [], experience: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const completeness = calcCompleteness({ ...user, ...form });

  useEffect(() => {
    if (user) setForm({
      fullName:   user.fullName   || "",
      phone:      user.phone      || "",
      location:   user.location   || "",
      bio:        user.bio        || "",
      skills:     user.skills     || [],
      education:  user.education  || [],
      experience: user.experience || [],
    });
  }, [user]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput("");
  };

  const addEdu = () => setForm({ ...form, education: [...form.education, { degree: "", institution: "", year: "" }] });
  const updateEdu = (i, k, v) => setForm({ ...form, education: form.education.map((e, idx) => idx === i ? { ...e, [k]: v } : e) });
  const removeEdu = (i) => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) });

  const addExp = () => setForm({ ...form, experience: [...form.experience, { title: "", company: "", duration: "", description: "" }] });
  const updateExp = (i, k, v) => setForm({ ...form, experience: form.experience.map((e, idx) => idx === i ? { ...e, [k]: v } : e) });
  const removeExp = (i) => setForm({ ...form, experience: form.experience.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed.");
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
      toast.success("Resume deleted.");
    } catch { toast.error("Delete failed."); }
  };

  const TABS = ["profile", "skills", "education", "experience", "resume"];

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header with completeness */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user?.fullName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user?.fullName}</h1>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  {user?.location && (
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <MapPin size={11} />{user.location}
                    </p>
                  )}
                </div>
                <Button onClick={handleSave} isLoading={isSaving} size="sm">
                  <Save size={13} /> Save
                </Button>
              </div>

              {/* Completeness bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">Profile Completeness</span>
                  <span className={`text-xs font-bold ${completeness >= 80 ? "text-green-600" : completeness >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                    {completeness}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completeness >= 80 ? "bg-green-500" : completeness >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                {completeness < 100 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {completeness < 50 ? "Complete your profile to get better job matches" : "Almost there! A complete profile gets 3x more views"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI Tools nudge */}
          {completeness >= 50 && (
            <Link to="/student/ai-tools"
              className="mt-4 flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors group">
              <Sparkles size={16} className="text-violet-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-violet-700">Your profile is ready for AI analysis!</p>
                <p className="text-[11px] text-violet-500">Analyze your resume, generate cover letters, prep for interviews →</p>
              </div>
            </Link>
          )}
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg capitalize transition-all whitespace-nowrap
                ${activeTab === tab ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB: Profile ─────────────────────────── */}
        {activeTab === "profile" && (
          <Card>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><User size={16} className="text-blue-600" /> Personal Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={form.fullName} onChange={set("fullName")} />
              <Input label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" icon={<Phone size={13} />} />
              <Input label="Location" value={form.location} onChange={set("location")} placeholder="City, State" icon={<MapPin size={13} />} className="sm:col-span-2" />
            </div>
            <Textarea label="Professional Summary" value={form.bio}
              onChange={set("bio")}
              placeholder="Write a compelling summary about your skills, goals, and what makes you unique..."
              rows={5} className="mt-4" />
            <p className="text-xs text-gray-400 mt-1.5">{form.bio.length}/500 characters</p>
          </Card>
        )}

        {/* ── TAB: Skills ──────────────────────────── */}
        {activeTab === "skills" && (
          <Card>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Star size={16} className="text-blue-600" /> Skills</h2>
            <div className="flex gap-2 mb-4">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter (e.g. React, Python)"
                className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} />
              </button>
            </div>
            {form.skills.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Star size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No skills added yet. Add your technical and soft skills.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <span key={skill}
                    className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-medium">
                    {skill}
                    <button onClick={() => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })}
                      className="text-blue-400 hover:text-blue-700 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3">{form.skills.length} skill{form.skills.length !== 1 ? "s" : ""} added</p>
          </Card>
        )}

        {/* ── TAB: Education ───────────────────────── */}
        {activeTab === "education" && (
          <Card>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><GraduationCap size={16} className="text-blue-600" /> Education</h2>
            {form.education.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mb-4">
                <GraduationCap size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No education added. Add your academic background.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {form.education.map((edu, i) => (
                  <div key={i} className="relative bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1">
                      <X size={14} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input placeholder="Degree / Course" value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} />
                      <Input placeholder="Institution / University" value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} />
                      <Input placeholder="Year (e.g. 2024)" value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={addEdu} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              <Plus size={15} /> Add Education
            </button>
          </Card>
        )}

        {/* ── TAB: Experience ──────────────────────── */}
        {activeTab === "experience" && (
          <Card>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Briefcase size={16} className="text-blue-600" /> Work Experience</h2>
            {form.experience.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mb-4">
                <Briefcase size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No experience added. Add your work history.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {form.experience.map((exp, i) => (
                  <div key={i} className="relative bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <button onClick={() => removeExp(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1">
                      <X size={14} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateExp(i, "title", e.target.value)} />
                      <Input placeholder="Company Name" value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} />
                      <Input placeholder="Duration (e.g. Jan 2023–Present)" value={exp.duration} onChange={(e) => updateExp(i, "duration", e.target.value)} />
                    </div>
                    <Textarea placeholder="Brief description of your role and achievements..."
                      value={exp.description} onChange={(e) => updateExp(i, "description", e.target.value)} rows={2} />
                  </div>
                ))}
              </div>
            )}
            <button onClick={addExp} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              <Plus size={15} /> Add Experience
            </button>
          </Card>
        )}

        {/* ── TAB: Resume ──────────────────────────── */}
        {activeTab === "resume" && (
          <Card>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><FileText size={16} className="text-blue-600" /> Resume</h2>
            {user?.resume?.filename ? (
              <div className="flex items-center justify-between p-5 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText size={22} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.resume.originalName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Active — used for applications</span>
                    </div>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={handleDeleteResume}>
                  <Trash2 size={13} /> Remove
                </Button>
              </div>
            ) : (
              <>
                <label className="flex flex-col items-center gap-4 cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-10 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                    {isUploading
                      ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      : <Upload size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {isUploading ? "Uploading..." : "Upload your resume"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">PDF or Word document · Max 5MB</p>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={isUploading} />
                </label>

                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    No resume uploaded yet. Jobs without a resume rely on your profile information only.
                  </p>
                </div>
              </>
            )}
          </Card>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} isLoading={isSaving} size="lg">
            <Save size={15} /> Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
