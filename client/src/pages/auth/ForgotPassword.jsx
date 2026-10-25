import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

import AuthShell from "../../components/layout/AuthShell.jsx";
import Banner from "../../components/ui/Banner.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { forgotPassword } from "../../services/authService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  const [serverError, setServerError] = useState(null);

  const isValidEmail = EMAIL_REGEX.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail || submitting) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await forgotPassword(email.trim());
      setSubmitted(true);
      setServerMessage(
        res.message ||
          "If an account is associated with that email, we have dispatched a password reset link. Please check your inbox."
      );
    } catch (err) {
      const data = err?.response?.data;
      setServerError(
        data?.message || "Failed to process password reset request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your verified email address and we'll send you a secure link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      {submitted ? (
        <div className="space-y-6 text-center animate-fade-in">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/40">
            <Mail className="size-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">Check Your Email</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {serverMessage}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left text-xs text-zinc-400 space-y-2">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>Security Note</span>
            </div>
            <p>
              The password reset link is valid for <strong>1 hour</strong> and can only be used once. If you do not see the email, please check your spam or junk folder.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <Banner variant="danger" role="alert">
              {serverError}
            </Banner>
          )}

          <div>
            <label
              htmlFor="reset-email"
              className="block text-sm font-medium text-zinc-200 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <input
                id="reset-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
              />
              <Mail className="absolute right-3.5 top-3 size-4 text-zinc-500 pointer-events-none" />
            </div>
            <p className="mt-1.5 text-2xs text-zinc-400">
              We'll send a one-time reset link to this address.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isValidEmail || submitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-fast hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-600/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="!text-white" />
                <span>Sending link…</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
