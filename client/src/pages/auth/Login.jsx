import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Lock, AlertCircle, Mail } from "lucide-react";

import { useAuth } from "../../context/useAuth.js";
import AuthShell from "../../components/layout/AuthShell.jsx";
import Banner from "../../components/ui/Banner.jsx";
import PasswordInput from "../../components/ui/PasswordInput.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_ERROR = "Couldn't sign in. Please try again.";

const extractServerError = (err) => {
  const data = err?.response?.data;
  if (!data) return FALLBACK_ERROR;
  if (typeof data.errors === "object" && data.errors) {
    const first = Object.values(data.errors)[0];
    if (first) return String(first);
  }
  return data.message || FALLBACK_ERROR;
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stepNotice, setStepNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isUnverified, setIsUnverified] = useState(false);

  const hasCapitalLetters = useMemo(() => /[A-Z]/.test(email), [email]);

  const isEmailValid = useMemo(
    () => EMAIL_REGEX.test(email.trim()) && !hasCapitalLetters,
    [email, hasCapitalLetters]
  );

  const canSubmit = useMemo(
    () => isEmailValid && password.length > 0 && !submitting,
    [isEmailValid, password, submitting]
  );

  const handlePasswordFocus = () => {
    if (!isEmailValid) {
      if (hasCapitalLetters) {
        setStepNotice("Capital letters detected in email. Please use lowercase first before entering your password.");
      } else {
        setStepNotice("Please enter a valid lowercase email address first before entering your password.");
      }
      emailRef.current?.focus();
    } else {
      setStepNotice(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setServerError(null);
    setIsUnverified(false);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === "EMAIL_NOT_VERIFIED") {
        setIsUnverified(true);
      }
      setServerError(extractServerError(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your email and password to access VYBE."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Create one now
          </Link>
        </>
      }
    >
      {stepNotice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 animate-modal-in">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{stepNotice}</span>
        </div>
      )}

      {serverError && (
        <div className="mb-5 space-y-2">
          <Banner variant="danger" role="alert">
            {serverError}
          </Banner>
          {isUnverified && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-purple-200">
                Need to verify your email before signing in?
              </span>
              <Link
                to={`/verify-email-pending?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                state={{ email: email.trim().toLowerCase() }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 font-medium text-white hover:bg-purple-500 transition-all shadow-sm"
              >
                <Mail className="size-3.5" />
                <span>Verify Email Now</span>
              </Link>
            </div>
          )}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* Field 1: Email (with uppercase detection) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              Email address
            </label>
            {isEmailValid && (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" /> Valid
              </span>
            )}
          </div>
          <input
            ref={emailRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (stepNotice) setStepNotice(null);
            }}
            placeholder="you@example.com"
            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs transition-all duration-fast placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-zinc-800 dark:bg-[#171522] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-purple-400 dark:focus:bg-[#1A1827]"
          />

          {/* Capital letters alert & quick-fix button */}
          {hasCapitalLetters && (
            <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300 animate-fade-in">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0 text-amber-400" />
                Capital letters detected! Emails must be lowercase.
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail(email.toLowerCase());
                  if (stepNotice) setStepNotice(null);
                }}
                className="shrink-0 rounded bg-amber-500/20 px-2 py-0.5 text-2xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
              >
                Convert to lowercase
              </button>
            </div>
          )}
        </div>

        {/* Field 2: Password (Gated by Email) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className={`block text-sm font-medium ${isEmailValid ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              Password
            </label>
            {isEmailValid ? (
              <Link
                to="/forgot-password"
                className="text-2xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-2xs text-zinc-400">
                <Lock className="size-2.5" /> Fill lowercase email first
              </span>
            )}
          </div>
          <div onFocus={handlePasswordFocus}>
            <PasswordInput
              ref={passwordRef}
              id="login-password"
              name="password"
              autoComplete="current-password"
              required
              disabled={!isEmailValid}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (stepNotice) setStepNotice(null);
              }}
              placeholder={isEmailValid ? "Enter your password" : "Enter lowercase email above first"}
              className={!isEmailValid ? "cursor-not-allowed bg-zinc-100/50 dark:bg-zinc-900/40 text-zinc-400 rounded-xl" : "rounded-xl"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-fast hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-600/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="!text-white" />
              <span>Signing in…</span>
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
