import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

import AuthShell from "../../components/layout/AuthShell.jsx";
import Banner from "../../components/ui/Banner.jsx";
import PasswordInput from "../../components/ui/PasswordInput.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { resetPassword } from "../../services/authService.js";

const evaluatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "Empty", color: "bg-zinc-700" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 15) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-rose-500" };
  if (score <= 4) return { score, label: "Good", color: "bg-amber-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isLengthValid = password.length >= 8;

  const canSubmit = isLengthValid && passwordsMatch && !submitting && Boolean(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await resetPassword({
        token,
        password,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      const data = err?.response?.data;
      setServerError(
        data?.message ||
          "Failed to reset password. The link may have expired or is invalid."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create new password"
      subtitle="Enter a strong, secure new password for your VYBE account."
      footer={
        <>
          Need help?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Return to Sign in
          </Link>
        </>
      }
    >
      {!token ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
            <AlertCircle className="size-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-zinc-100">
              Invalid or Missing Reset Token
            </h3>
            <p className="text-xs text-zinc-400">
              No valid password reset token was detected in your URL. Please request a new password reset link.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-500 transition-all"
          >
            <span>Request New Reset Link</span>
          </Link>
        </div>
      ) : success ? (
        <div className="space-y-6 text-center animate-fade-in">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/40">
            <CheckCircle2 className="size-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">
              Password Reset Complete!
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your password has been securely updated. You can now log into your account using your new credentials.
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <span>Sign In to VYBE</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <Banner variant="danger" role="alert">
              {serverError}
            </Banner>
          )}

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-zinc-200"
              >
                New Password
              </label>
              {password && (
                <span className={`text-2xs font-semibold ${
                  strength.label === "Strong"
                    ? "text-emerald-400"
                    : strength.label === "Good"
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}>
                  Strength: {strength.label}
                </span>
              )}
            </div>
            <PasswordInput
              id="new-password"
              name="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min. 15 chars recommended)"
              className="rounded-xl"
            />

            {/* Strength Meter Bars */}
            {password && (
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      strength.score >= level ? strength.color : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            )}
            <p className="mt-1.5 text-2xs text-zinc-400">
              Must be at least 8 characters (15+ chars recommended for maximum security).
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium text-zinc-200"
              >
                Confirm New Password
              </label>
              {confirmPassword && (
                <span className={`text-2xs font-semibold ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  {passwordsMatch ? "Passwords match" : "Does not match"}
                </span>
              )}
            </div>
            <PasswordInput
              id="confirm-new-password"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-fast hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-600/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="!text-white" />
                <span>Updating Password…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                <span>Reset & Set New Password</span>
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
