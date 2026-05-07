import { useState } from "react";
import {
  Sparkles, FileText, MessageSquare, BookOpen,
  TrendingUp, ChevronRight, Upload, Loader2,
  CheckCircle2, AlertCircle, Star, Zap, RefreshCw,
} from "lucide-react";
import { Button, Card, Textarea, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Ensure consistency: VITE_API_URL should always include /api. 
const API_URL = "/api";

// ── Claude API caller ─────────────────────────────────────────────────────
const callClaude = async (systemPrompt, userMessage, onChunk) => {
  const res = await fetch(`${API_URL}/ai/claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: systemPrompt,
      prompt: userMessage,
    }),
  });
  if (!res.ok) throw new Error("AI request failed");
  const data = await res.json();
  return data.data?.text || data.text || "";
};

// ── Tool definitions ──────────────────────────────────────────────────────
const TOOLS = [
  { id: "resume",    icon: <FileText size={20} />,     title: "Resume Analyzer",       color: "blue",   desc: "Get AI feedback on your resume" },
  { id: "cover",     icon: <MessageSquare size={20} />, title: "Cover Letter Generator", color: "violet", desc: "Generate personalized cover letters" },
  { id: "interview", icon: <BookOpen size={20} />,      title: "Interview Prep",         color: "green",  desc: "Practice with AI-generated questions" },
  { id: "skillgap",  icon: <Zap size={20} />,           title: "Skill Gap Analysis",     color: "orange", desc: "Find what skills you need to learn" },
  { id: "salary",    icon: <TrendingUp size={20} />,    title: "Salary Predictor",       color: "teal",   desc: "Know your market value" },
];

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200",   ring: "ring-blue-500" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", ring: "ring-violet-500" },
  green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200",  ring: "ring-green-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", ring: "ring-orange-500" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-200",   ring: "ring-teal-500" },
};

// ── Main Page ─────────────────────────────────────────────────────────────
const AIToolsPage = () => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState("resume");

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Career Assistant</h1>
            <p className="text-gray-500 text-sm">Powered by Claude AI — your personal career coach</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar tool picker */}
          <div className="lg:col-span-1 space-y-2">
            {TOOLS.map((tool) => {
              const c = COLOR_MAP[tool.color];
              const isActive = activeTool === tool.id;
              return (
                <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border
                    ${isActive ? `${c.bg} ${c.border} ring-1 ${c.ring}` : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${isActive ? `${c.bg} ${c.text}` : "bg-gray-100 text-gray-500"}`}>
                    {tool.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? c.text : "text-gray-800"}`}>{tool.title}</p>
                    <p className="text-xs text-gray-400 leading-tight">{tool.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active tool panel */}
          <div className="lg:col-span-3">
            {activeTool === "resume"    && <ResumeAnalyzer user={user} />}
            {activeTool === "cover"     && <CoverLetterGen user={user} />}
            {activeTool === "interview" && <InterviewPrep user={user} />}
            {activeTool === "skillgap"  && <SkillGapTool user={user} />}
            {activeTool === "salary"    && <SalaryPredictor user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 1. Resume Analyzer ─────────────────────────────────────────────────────
const ResumeAnalyzer = ({ user }) => {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!resumeText.trim()) return toast.error("Please paste your resume text.");
    setLoading(true);
    setResult(null);
    try {
      const systemPrompt = `You are an expert resume reviewer and career coach. Analyze resumes and provide actionable, structured feedback in JSON format only. No markdown outside JSON.`;
      const userMsg = `Analyze this resume and return JSON with exactly this structure:
{
  "overallScore": <number 0-100>,
  "strengths": [<string>, <string>, <string>],
  "improvements": [<string>, <string>, <string>],
  "keywordsFound": [<string>],
  "keywordsMissing": [<string>],
  "atsScore": <number 0-100>,
  "summary": "<2 sentence verdict>"
}

Resume:
${resumeText}

${user?.skills?.length ? `Candidate's stated skills: ${user.skills.join(", ")}` : ""}`;

      const raw = await callClaude(systemPrompt, userMsg);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setResult(parsed);
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <FileText size={18} className="text-blue-600" />
        <h2 className="font-bold text-gray-900">Resume Analyzer</h2>
        <span className="ml-auto text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
      </div>

      <Textarea
        label="Paste your resume text"
        placeholder="Copy and paste your entire resume here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        rows={8}
      />

      <Button onClick={analyze} isLoading={loading} className="mt-4 w-full" size="lg">
        <Sparkles size={16} /> Analyze My Resume
      </Button>

      {result && (
        <div className="mt-6 space-y-5">
          {/* Score cards */}
          <div className="grid grid-cols-2 gap-3">
            <ScoreCard label="Overall Score" score={result.overallScore} color="blue" />
            <ScoreCard label="ATS Score" score={result.atsScore} color="violet" />
          </div>

          <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4 leading-relaxed italic">
            "{result.summary}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeedbackList title="Strengths" items={result.strengths} type="success" />
            <FeedbackList title="Improvements Needed" items={result.improvements} type="warning" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KeywordList title="Keywords Found" items={result.keywordsFound} color="green" />
            <KeywordList title="Missing Keywords" items={result.keywordsMissing} color="red" />
          </div>
        </div>
      )}
    </Card>
  );
};

// ── 2. Cover Letter Generator ───────────────────────────────────────────────
const CoverLetterGen = ({ user }) => {
  const [form, setForm] = useState({ jobTitle: "", company: "", jobDesc: "", tone: "professional" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.jobTitle || !form.company) return toast.error("Please fill job title and company.");
    setLoading(true);
    setResult("");
    try {
      const systemPrompt = `You are an expert cover letter writer. Write compelling, personalized cover letters that get interviews. Be specific, concise, and authentic.`;
      const userMsg = `Write a ${form.tone} cover letter for:
Job Title: ${form.jobTitle}
Company: ${form.company}
${form.jobDesc ? `Job Description: ${form.jobDesc}` : ""}
${user?.fullName ? `Candidate Name: ${user.fullName}` : ""}
${user?.skills?.length ? `Skills: ${user.skills.join(", ")}` : ""}
${user?.experience?.length ? `Experience: ${user.experience.map((e) => `${e.title} at ${e.company}`).join(", ")}` : ""}

Write a complete, ready-to-send cover letter (3-4 paragraphs). Start directly with "Dear Hiring Manager," - no preamble.`;

      const text = await callClaude(systemPrompt, userMsg);
      setResult(text);
    } catch {
      toast.error("Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copied to clipboard!"); };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <MessageSquare size={18} className="text-violet-600" />
        <h2 className="font-bold text-gray-900">Cover Letter Generator</h2>
        <span className="ml-auto text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input label="Job Title *" placeholder="e.g. Frontend Developer" value={form.jobTitle}
          onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
        <Input label="Company Name *" placeholder="e.g. Google" value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>

      <Textarea label="Job Description (optional, improves quality)" placeholder="Paste the job description here..."
        value={form.jobDesc} onChange={(e) => setForm({ ...form, jobDesc: e.target.value })} rows={4} className="mb-4" />

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tone</label>
        <div className="flex gap-2">
          {["professional", "friendly", "enthusiastic"].map((t) => (
            <button key={t} onClick={() => setForm({ ...form, tone: t })}
              className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all
                ${form.tone === t ? "bg-violet-600 text-white border-violet-600" : "bg-white border-gray-300 text-gray-600 hover:border-violet-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={generate} isLoading={loading} className="w-full" size="lg"
        style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
        <Sparkles size={16} /> Generate Cover Letter
      </Button>

      {result && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Generated Cover Letter</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="xs" onClick={() => generate()}>
                <RefreshCw size={11} /> Regenerate
              </Button>
              <Button variant="outline" size="xs" onClick={copy}>Copy</Button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {result}
          </div>
        </div>
      )}
    </Card>
  );
};

// ── 3. Interview Prep ──────────────────────────────────────────────────────
const InterviewPrep = ({ user }) => {
  const [jobRole, setJobRole] = useState("");
  const [type, setType] = useState("technical");
  const [questions, setQuestions] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!jobRole.trim()) return toast.error("Enter a job role first.");
    setLoading(true);
    setQuestions([]);
    try {
      const systemPrompt = `You are an expert interviewer at a top tech company. Generate realistic interview questions with ideal answers in JSON format only.`;
      const userMsg = `Generate 8 ${type} interview questions for a ${jobRole} role.
${user?.skills?.length ? `Candidate skills: ${user.skills.join(", ")}` : ""}

Return JSON array only:
[
  {
    "question": "<question>",
    "category": "<Behavioral|Technical|Situational>",
    "difficulty": "<Easy|Medium|Hard>",
    "idealAnswer": "<2-3 sentence ideal answer>"
  }
]`;

      const raw = await callClaude(systemPrompt, userMsg);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setQuestions(parsed);
    } catch {
      toast.error("Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const diffColor = (d) => d === "Easy" ? "text-green-600 bg-green-50 border-green-200"
    : d === "Medium" ? "text-yellow-700 bg-yellow-50 border-yellow-200"
    : "text-red-600 bg-red-50 border-red-200";

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <BookOpen size={18} className="text-green-600" />
        <h2 className="font-bold text-gray-900">Interview Prep</h2>
        <span className="ml-auto text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
      </div>

      <div className="flex gap-3 mb-4">
        <Input label="Job Role" placeholder="e.g. Senior React Developer"
          value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="flex-1" />
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-500 bg-white">
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <Button onClick={generate} isLoading={loading} className="w-full" size="lg"
        style={{ background: "#16a34a" }}>
        <Sparkles size={16} /> Generate Interview Questions
      </Button>

      {questions.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{questions.length} Questions Generated</p>
          {questions.map((q, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm font-medium text-gray-800 flex-1">{q.question}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                  <span className="text-xs text-gray-400">{openIdx === i ? "▲" : "▼"}</span>
                </div>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-green-50">
                  <p className="text-xs font-semibold text-green-700 mt-3 mb-1.5">Ideal Answer:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{q.idealAnswer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ── 4. Skill Gap Analysis ──────────────────────────────────────────────────
const SkillGapTool = ({ user }) => {
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!targetRole.trim()) return toast.error("Enter your target role.");
    setLoading(true);
    setResult(null);
    try {
      const systemPrompt = `You are a career development expert. Analyze skill gaps and create actionable learning roadmaps. Return JSON only.`;
      const userMsg = `Analyze skill gap for someone targeting: ${targetRole}
Current skills: ${user?.skills?.join(", ") || "Not specified"}
Experience: ${user?.experience?.map((e) => e.title).join(", ") || "Not specified"}

Return JSON:
{
  "matchPercent": <0-100>,
  "strongSkills": [<skill>],
  "gapSkills": [{"skill": "<name>", "priority": "High|Medium|Low", "learnIn": "<timeframe>"}],
  "roadmap": [{"step": <number>, "action": "<action>", "resource": "<platform/resource>", "duration": "<time>"}],
  "verdict": "<2 sentence summary>"
}`;

      const raw = await callClaude(systemPrompt, userMsg);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(cleaned));
    } catch {
      toast.error("Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = (p) => p === "High" ? "bg-red-50 text-red-600 border-red-200"
    : p === "Medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200"
    : "bg-green-50 text-green-600 border-green-200";

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <Zap size={18} className="text-orange-500" />
        <h2 className="font-bold text-gray-900">Skill Gap Analysis</h2>
        <span className="ml-auto text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
      </div>

      <Input label="Target Job Role" placeholder="e.g. Full Stack Developer at a startup"
        value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="mb-4" />
      {(!user?.skills?.length) && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Tip: Add your skills to your profile for a more accurate analysis.
        </p>
      )}
      <Button onClick={analyze} isLoading={loading} className="w-full" size="lg"
        style={{ background: "#ea580c" }}>
        <Sparkles size={16} /> Analyze Skill Gaps
      </Button>

      {result && (
        <div className="mt-5 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="text-center">
              <p className="text-3xl font-black text-orange-600">{result.matchPercent}%</p>
              <p className="text-xs text-orange-500">Role Match</p>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${result.matchPercent}%` }} />
              </div>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{result.verdict}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Strong Skills ✓</p>
              <div className="flex flex-wrap gap-1.5">
                {result.strongSkills?.map((s) => (
                  <span key={s} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Skills to Learn</p>
              <div className="space-y-1.5">
                {result.gapSkills?.map((g) => (
                  <div key={g.skill} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{g.skill}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">{g.learnIn}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColor(g.priority)}`}>{g.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">Learning Roadmap</p>
            <div className="space-y-2">
              {result.roadmap?.map((step) => (
                <div key={step.step} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{step.step}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{step.action}</p>
                    <p className="text-xs text-gray-500">{step.resource} · {step.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── 5. Salary Predictor ────────────────────────────────────────────────────
const SalaryPredictor = ({ user }) => {
  const [form, setForm] = useState({
    role: "", location: "Bangalore", experience: "2", skills: user?.skills?.join(", ") || "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    if (!form.role.trim()) return toast.error("Enter a job role.");
    setLoading(true);
    setResult(null);
    try {
      const systemPrompt = `You are a compensation expert with deep knowledge of Indian tech industry salaries. Return JSON only.`;
      const userMsg = `Predict salary for:
Role: ${form.role}
Location: ${form.location}
Experience: ${form.experience} years
Skills: ${form.skills}

Return JSON:
{
  "minSalary": <number in LPA>,
  "maxSalary": <number in LPA>,
  "medianSalary": <number in LPA>,
  "topCompanies": [{"name": "<company>", "range": "<X-Y LPA>"}],
  "factors": [{"factor": "<name>", "impact": "Positive|Negative|Neutral", "note": "<brief note>"}],
  "negotiationTip": "<1 actionable negotiation tip>",
  "marketOutlook": "Growing|Stable|Declining"
}`;

      const raw = await callClaude(systemPrompt, userMsg);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(cleaned));
    } catch {
      toast.error("Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <TrendingUp size={18} className="text-teal-600" />
        <h2 className="font-bold text-gray-900">Salary Predictor</h2>
        <span className="ml-auto text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input label="Job Role" placeholder="e.g. React Developer" value={form.role} onChange={set("role")} />
        <Input label="Location" placeholder="e.g. Bangalore" value={form.location} onChange={set("location")} />
        <Input label="Years of Experience" type="number" min="0" max="30" value={form.experience} onChange={set("experience")} />
        <Input label="Key Skills (comma separated)" placeholder="React, Node.js, AWS" value={form.skills} onChange={set("skills")} />
      </div>

      <Button onClick={predict} isLoading={loading} className="w-full" size="lg"
        style={{ background: "#0d9488" }}>
        <Sparkles size={16} /> Predict My Salary
      </Button>

      {result && (
        <div className="mt-5 space-y-4">
          {/* Main salary range */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
            <p className="text-xs text-teal-600 font-semibold mb-1">Expected Salary Range</p>
            <p className="text-4xl font-black text-teal-700">₹{result.minSalary}L – ₹{result.maxSalary}L</p>
            <p className="text-sm text-teal-600 mt-1">Median: <strong>₹{result.medianSalary} LPA</strong></p>
            <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full
              ${result.marketOutlook === "Growing" ? "bg-green-100 text-green-700" : result.marketOutlook === "Declining" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
              Market: {result.marketOutlook}
            </span>
          </div>

          {/* Top companies */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">What Top Companies Pay</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {result.topCompanies?.map((c) => (
                <div key={c.name} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-teal-600 font-bold mt-0.5">{c.range}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiation tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Negotiation Tip</p>
            <p className="text-sm text-blue-800">{result.negotiationTip}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Shared sub-components ──────────────────────────────────────────────────
const ScoreCard = ({ label, score, color }) => {
  const c = color === "blue" ? { ring: "bg-blue-600", text: "text-blue-600", bg: "bg-blue-50" }
    : { ring: "bg-violet-600", text: "text-violet-600", bg: "bg-violet-50" };
  return (
    <div className={`${c.bg} rounded-xl p-4 text-center`}>
      <p className={`text-3xl font-black ${c.text}`}>{score}/100</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <div className="h-2 bg-white/60 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${c.ring} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

const FeedbackList = ({ title, items = [], type }) => {
  const colors = type === "success"
    ? { bg: "bg-green-50", border: "border-green-200", icon: "text-green-500", title: "text-green-700" }
    : { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", title: "text-amber-700" };
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
      <p className={`text-xs font-semibold ${colors.title} mb-2`}>{title}</p>
      <ul className="space-y-1.5">
        {items?.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs text-gray-700">
            {type === "success"
              ? <CheckCircle2 size={12} className={`${colors.icon} shrink-0 mt-0.5`} />
              : <AlertCircle size={12} className={`${colors.icon} shrink-0 mt-0.5`} />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const KeywordList = ({ title, items = [], color }) => {
  const colors = color === "green"
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-red-50 text-red-600 border-red-200";
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items?.length > 0
          ? items.map((k) => (
              <span key={k} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colors}`}>{k}</span>
            ))
          : <span className="text-xs text-gray-400">None found</span>
        }
      </div>
    </div>
  );
};

export default AIToolsPage;
