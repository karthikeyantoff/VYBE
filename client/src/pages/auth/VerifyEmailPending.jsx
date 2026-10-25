import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

import AuthShell from "../../components/layout/AuthShell.jsx";
import Banner from "../../components/ui/Banner.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { resendVerification } from "../../services/authService.js";

export default function VerifyEmailPending() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const emailParam = location.state?.email || searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    if (!email || cooldown > 0 || submitting) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await resendVerification(email.trim());
      setMessage(
        res.message ||
          "If an unverified account exists for this email, a fresh verification link has been dispatched."
      );
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.message ||
          "Could not resend verification email at this moment. Please wait a moment and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Check your inbox"
      subtitle="We need to verify your email address before you can access VYBE."
      footer={
        <>
          Already verified your account?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6 text-center">
        {/* Animated illustration badge */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-purple-600/30 border border-purple-500/30 text-purple-400 shadow-xl shadow-purple-900/20">
          <Mail className="size-10 animate-pulse text-purple-300" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-zinc-300">
            A confirmation link has been sent to:
          </p>
          <div className="inline-block rounded-xl border border-purple-500/30 bg-purple-950/40 px-4 py-2 font-mono text-sm font-semibold text-purple-200">
            {email || "your email address"}
          </div>
          <p className="text-xs text-zinc-400">
            Click the link in the email to activate your account. Links expire in 24 hours.
          </p>
        </div>

        {message && (
          <Banner variant="success" className="text-left">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{message}</span>
            </div>
          </Banner>
        )}

        {error && (
          <Banner variant="danger" className="text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          </Banner>
        )}

        {/* Resend Action Card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left space-y-3">
          <div className="text-xs font-medium text-zinc-300">
            Didn't receive the email?
          </div>
          <p className="text-[11px] text-zinc-400">
            Check your spam/junk folder. If it's still missing, you can request a new verification link below.
          </p>

          {!emailParam && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="block w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
            />
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={!email || cooldown > 0 || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <>
                <Spinner size="xs" />
                <span>Sending new link…</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Resend available in {cooldown}s</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" />
                <span>Resend verification email</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
