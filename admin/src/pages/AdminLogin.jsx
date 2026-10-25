import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Sparkles, ExternalLink, Activity } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@vybe.dev");
  const [password, setPassword] = useState("VybeAdmin2026!");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Admin authentication failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-[#13111C] admin-ambient-glow overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Badge */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-2xs font-semibold text-purple-300 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB Atlas (VYBE_db) Connected</span>
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#A7A0BE] hover:text-white transition-colors"
          >
            <span>Main App</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl border border-purple-500/25 bg-[#1B1827]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
              <Shield className="size-7" />
              <span className="absolute -top-1 -right-1 flex size-3.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex size-3.5 rounded-full bg-purple-500 border-2 border-[#1B1827]" />
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              VYBE <span className="admin-gradient-text">Admin Center</span>
            </h1>
            <p className="mt-1.5 text-xs text-[#A7A0BE] max-w-xs mx-auto">
              Secure moderation hub for managing users, monitoring posts, and auditing system analytics.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-fade-up">
              <AlertCircle className="size-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A7A0BE] uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#787095]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vybe.dev"
                  className="w-full rounded-xl border border-white/10 bg-[#13111C]/80 py-2.5 pl-10 pr-3.5 text-sm text-[#F3F0FA] placeholder-[#554E6E] focus:border-purple-400 focus:bg-[#1A1827] focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7A0BE] uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#787095]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#13111C]/80 py-2.5 pl-10 pr-3.5 text-sm text-[#F3F0FA] placeholder-[#554E6E] focus:border-purple-400 focus:bg-[#1A1827] focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-60 transition-all"
            >
              <span>{submitting ? "Authenticating..." : "Access Dashboard"}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Preset hint footer */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-[11px] text-[#787095]">
              Pre-filled with master credentials seeded in Atlas: <br />
              <code className="text-purple-300 font-mono text-[10px]">admin@vybe.dev</code>
            </p>
          </div>
        </div>

        {/* Live system health card below */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-[#1B1827]/40 px-4 py-3 text-xs text-[#787095]">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-purple-400" />
            <span>Port: 5174 (Standalone Admin)</span>
          </div>
          <span className="font-mono text-[10px] text-purple-400">REST API :5000</span>
        </div>
      </div>
    </div>
  );
}
