import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth.js";
import AuthShell from "../../components/layout/AuthShell.jsx";
import Banner from "../../components/ui/Banner.jsx";
import PasswordInput from "../../components/ui/PasswordInput.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9][a-z0-9_.]{1,18}[a-z0-9]$/;
const NAME_REGEX = /^[A-Za-z\s'-]{2,60}$/;
const RESERVED_NAMES = [
  "admin",
  "administrator",
  "api",
  "support",
  "login",
  "signup",
  "register",
  "settings",
  "moderator",
  "help",
  "security",
  "root",
  "vybe",
  "system",
  "explore",
  "feed",
  "notifications",
  "saved",
];
const FALLBACK_ERROR = "Couldn't create your account. Please try again.";

const sanitizeUsername = (raw) =>
  raw
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, 20);

const scorePassword = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Za-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return score;
};

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLORS = [
  "bg-zinc-200 dark:bg-zinc-800",
  "bg-rose-500",
  "bg-amber-500",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-emerald-600",
];

function StrengthMeter({ password, score }) {
  const colorClass = STRENGTH_COLORS[score] ?? STRENGTH_COLORS[0];
  const filled = Math.max(score, 0);

  const hasLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-2xs font-medium text-zinc-500 dark:text-zinc-400">
        <span>Password strength</span>
        <span className={score >= 4 ? "text-emerald-500 font-semibold" : score >= 2 ? "text-amber-500 font-semibold" : "text-rose-500 font-semibold"}>
          {STRENGTH_LABELS[score]}
        </span>
      </div>

      <div
        className="grid grid-cols-5 gap-1"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label="Password strength"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-colors duration-fast ${
              i < filled ? colorClass : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <ul className="space-y-1 text-2xs text-zinc-500 dark:text-zinc-400">
        <li className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
          <span className={`inline-flex size-3.5 items-center justify-center rounded-full text-[9px] ${hasLength ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}>
            {hasLength ? "✓" : "•"}
          </span>
          At least 8 characters (15+ recommended)
        </li>
        <li className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
          <span className={`inline-flex size-3.5 items-center justify-center rounded-full text-[9px] ${hasLetter ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}>
            {hasLetter ? "✓" : "•"}
          </span>
          Both uppercase and lowercase letters
        </li>
        <li className={`flex items-center gap-1.5 ${hasDigit ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
          <span className={`inline-flex size-3.5 items-center justify-center rounded-full text-[9px] ${hasDigit ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}>
            {hasDigit ? "✓" : "•"}
          </span>
          At least one number (0-9)
        </li>
        <li className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
          <span className={`inline-flex size-3.5 items-center justify-center rounded-full text-[9px] ${hasSymbol ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}>
            {hasSymbol ? "✓" : "•"}
          </span>
          Bonus: Special symbol (!@#$%)
        </li>
      </ul>
    </div>
  );
}

const initialFieldErrors = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const nameInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [stepNotice, setStepNotice] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validateField = (field, value, allValues = form) => {
    switch (field) {
      case "name": {
        const trimmed = value.trim();
        if (!trimmed) return "Full name is required.";
        if (/\d/.test(value)) {
          return "Numbers are not allowed in name. Letters and spaces only.";
        }
        if (!NAME_REGEX.test(trimmed)) {
          return "Only letters, spaces, hyphens, and apostrophes are allowed.";
        }
        if (trimmed.length < 2) return "Name must be at least 2 characters.";
        if (trimmed.length > 60) return "Name can be at most 60 characters.";
        return "";
      }
      case "username": {
        if (!value) return "Username is required.";
        if (value.length < 3 || value.length > 20) {
          return "Username must be between 3 and 20 characters.";
        }
        if (/\.\./.test(value)) {
          return "Username cannot contain consecutive periods.";
        }
        if (!USERNAME_REGEX.test(value)) {
          return "Must start and end with a letter or number; only letters, numbers, underscores, and periods.";
        }
        if (RESERVED_NAMES.includes(value.toLowerCase())) {
          return "This username is reserved and cannot be registered.";
        }
        return "";
      }
      case "email": {
        if (!value.trim()) return "Email is required.";
        if (/[A-Z]/.test(value)) {
          return "Capital letters are not allowed in email. Please use lowercase only.";
        }
        if (!EMAIL_REGEX.test(value.trim())) {
          return "Enter a valid email address (e.g. name@domain.com).";
        }
        return "";
      }
      case "password": {
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
          return "Password must include at least one letter and one number.";
        }
        return "";
      }
      case "confirmPassword": {
        if (!value) return "Password confirmation is required.";
        if (value !== allValues.password) return "Passwords do not match.";
        return "";
      }
      default:
        return "";
    }
  };

  // Field validation status for sequential gating
  const isNameValid = useMemo(() => validateField("name", form.name) === "", [form.name]);
  const isUsernameValid = useMemo(
    () => isNameValid && validateField("username", form.username) === "",
    [isNameValid, form.username]
  );
  const isEmailValid = useMemo(
    () => isUsernameValid && validateField("email", form.email) === "",
    [isUsernameValid, form.email]
  );
  const isPasswordValid = useMemo(
    () => isEmailValid && validateField("password", form.password) === "",
    [isEmailValid, form.password]
  );
  const isConfirmPasswordValid = useMemo(
    () =>
      isPasswordValid &&
      validateField("confirmPassword", form.confirmPassword, form) === "",
    [isPasswordValid, form.confirmPassword, form]
  );

  const passwordScore = useMemo(() => scorePassword(form.password), [form.password]);
  const allValid =
    isNameValid &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid;

  const setField = (field, value) => {
    if (field === "name" && /\d/.test(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        name: "Numbers are not allowed in name. Letters and spaces only.",
      }));
    } else if (field === "email" && /[A-Z]/.test(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Capital letters are not allowed in email. Please use lowercase only.",
      }));
    } else if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    if (stepNotice) setStepNotice(null);
  };

  const handleBlur = (field) => () => {
    const message = validateField(field, form[field], form);
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleFieldFocus = (targetField) => {
    if (targetField === "username" && !isNameValid) {
      setStepNotice("Please enter your full name first before entering a username.");
      nameInputRef.current?.focus();
    } else if (targetField === "email" && !isUsernameValid) {
      setStepNotice("Please choose a valid username first before entering your email.");
      usernameInputRef.current?.focus();
    } else if (targetField === "password" && !isEmailValid) {
      if (/[A-Z]/.test(form.email)) {
        setStepNotice("Capital letters detected in email. Please convert to lowercase first before entering a password.");
      } else {
        setStepNotice("Please enter a valid lowercase email address first before setting a password.");
      }
      emailInputRef.current?.focus();
    } else if (targetField === "confirmPassword" && !isPasswordValid) {
      setStepNotice("Please set a valid password first before confirming it.");
      passwordInputRef.current?.focus();
    } else {
      setStepNotice(null);
    }
  };

  const handleServerError = (err) => {
    const data = err?.response?.data;
    const nextErrors = { ...initialFieldErrors };
    let banner = null;

    if (data?.errors && typeof data.errors === "object") {
      for (const [field, msg] of Object.entries(data.errors)) {
        if (field in nextErrors) nextErrors[field] = String(msg);
      }
      const hasFieldError = Object.values(nextErrors).some(Boolean);
      if (!hasFieldError) banner = data.message || FALLBACK_ERROR;
    } else if (Array.isArray(data?.errors)) {
      for (const item of data.errors) {
        const field = item?.field || item?.path;
        if (field && field in nextErrors) {
          nextErrors[field] = String(item.msg || item.message || "");
        }
      }
      const hasFieldError = Object.values(nextErrors).some(Boolean);
      if (!hasFieldError) banner = data.message || FALLBACK_ERROR;
    } else {
      banner = data?.message || FALLBACK_ERROR;
    }

    setFieldErrors(nextErrors);
    setServerError(banner);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      name: validateField("name", form.name),
      username: validateField("username", form.username),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      confirmPassword: validateField("confirmPassword", form.confirmPassword, form),
    };
    setFieldErrors(nextErrors);

    const hasAnyError = Object.values(nextErrors).some(Boolean);
    if (hasAnyError) {
      if (nextErrors.name) nameInputRef.current?.focus();
      else if (nextErrors.username) usernameInputRef.current?.focus();
      else if (nextErrors.email) emailInputRef.current?.focus();
      else if (nextErrors.password) passwordInputRef.current?.focus();
      else if (nextErrors.confirmPassword) confirmPasswordInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await register({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      toast.success(
        response?.message || "Registration successful! Please check your email to verify your account.",
        { duration: 5000 }
      );

      navigate("/verify-email-pending", {
        replace: true,
        state: { email: form.email.trim().toLowerCase() },
      });
    } catch (err) {
      handleServerError(err);
      setSubmitting(false);
    }
  };

  const inputClass = (hasError, isDisabled) =>
    `block w-full rounded-xl border py-2.5 text-sm transition-all duration-fast shadow-xs focus:outline-none ${
      isDisabled
        ? "cursor-not-allowed bg-zinc-100/60 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800"
        : hasError
        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 placeholder:text-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#171522] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-purple-500 focus:bg-white dark:focus:bg-[#1A1827] focus:ring-2 focus:ring-purple-500/20"
    }`;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Complete each step sequentially to register on VYBE."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      {/* 5-Step Visual Stepper Header */}
      <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3 text-2xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-zinc-400 scrollbar-none font-medium">
          <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 whitespace-nowrap transition-colors ${isNameValid ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/20 text-purple-300"}`}>
            {isNameValid ? <Check className="size-3" /> : "1."} Name
          </span>
          <span className="text-zinc-600">›</span>
          <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 whitespace-nowrap transition-colors ${isUsernameValid ? "bg-emerald-500/10 text-emerald-400" : isNameValid ? "bg-purple-500/20 text-purple-300" : "text-zinc-500"}`}>
            {isUsernameValid ? <Check className="size-3" /> : "2."} Username
          </span>
          <span className="text-zinc-600">›</span>
          <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 whitespace-nowrap transition-colors ${isEmailValid ? "bg-emerald-500/10 text-emerald-400" : isUsernameValid ? "bg-purple-500/20 text-purple-300" : "text-zinc-500"}`}>
            {isEmailValid ? <Check className="size-3" /> : "3."} Email
          </span>
          <span className="text-zinc-600">›</span>
          <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 whitespace-nowrap transition-colors ${isPasswordValid ? "bg-emerald-500/10 text-emerald-400" : isEmailValid ? "bg-purple-500/20 text-purple-300" : "text-zinc-500"}`}>
            {isPasswordValid ? <Check className="size-3" /> : "4."} Password
          </span>
          <span className="text-zinc-600">›</span>
          <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 whitespace-nowrap transition-colors ${isConfirmPasswordValid ? "bg-emerald-500/10 text-emerald-400" : isPasswordValid ? "bg-purple-500/20 text-purple-300" : "text-zinc-500"}`}>
            {isConfirmPasswordValid ? <Check className="size-3" /> : "5."} Confirm
          </span>
        </div>
      </div>

      {stepNotice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 animate-modal-in">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{stepNotice}</span>
        </div>
      )}

      {serverError && (
        <Banner variant="danger" className="mb-5" role="alert">
          {serverError}
        </Banner>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Display Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="reg-name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              Full name <span className="text-xs font-normal text-zinc-400">(letters & spaces only)</span>
            </label>
            {isNameValid && (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" /> Valid
              </span>
            )}
          </div>
          <input
            ref={nameInputRef}
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={handleBlur("name")}
            placeholder="e.g. Karthikeyan"
            aria-invalid={fieldErrors.name ? "true" : undefined}
            className={`${inputClass(Boolean(fieldErrors.name), false)} px-3`}
          />
          {fieldErrors.name ? (
            <p id="reg-name-error" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
              {fieldErrors.name}
            </p>
          ) : (
            <p id="reg-name-helper" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Numbers are strictly not allowed.
            </p>
          )}
        </div>

        {/* Step 2: Username */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="reg-username"
              className={`block text-sm font-medium ${isNameValid ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              Username
            </label>
            {!isNameValid ? (
              <span className="flex items-center gap-1 text-2xs text-zinc-400">
                <Lock className="size-2.5" /> Complete name first
              </span>
            ) : isUsernameValid ? (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" /> Valid
              </span>
            ) : null}
          </div>
          <div className="relative">
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm ${isNameValid ? "text-zinc-400" : "text-zinc-300 dark:text-zinc-700"}`}
            >
              @
            </span>
            <input
              ref={usernameInputRef}
              id="reg-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={!isNameValid}
              value={form.username}
              onFocus={() => handleFieldFocus("username")}
              onChange={(e) => setField("username", sanitizeUsername(e.target.value))}
              onBlur={handleBlur("username")}
              placeholder="karthik.dev"
              aria-invalid={fieldErrors.username ? "true" : undefined}
              className={`${inputClass(Boolean(fieldErrors.username), !isNameValid)} pl-7 pr-3`}
            />
          </div>
          {fieldErrors.username ? (
            <p id="reg-username-error" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
              {fieldErrors.username}
            </p>
          ) : (
            <p id="reg-username-helper" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              3–20 chars; letters, numbers, underscores, and periods.
            </p>
          )}
        </div>

        {/* Step 3: Email (with uppercase letter detection) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="reg-email"
              className={`block text-sm font-medium ${isUsernameValid ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              Email address
            </label>
            {!isUsernameValid ? (
              <span className="flex items-center gap-1 text-2xs text-zinc-400">
                <Lock className="size-2.5" /> Complete username first
              </span>
            ) : isEmailValid ? (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" /> Valid
              </span>
            ) : null}
          </div>
          <input
            ref={emailInputRef}
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={!isUsernameValid}
            value={form.email}
            onFocus={() => handleFieldFocus("email")}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={handleBlur("email")}
            placeholder="you@example.com"
            aria-invalid={fieldErrors.email || /[A-Z]/.test(form.email) ? "true" : undefined}
            className={`${inputClass(Boolean(fieldErrors.email || /[A-Z]/.test(form.email)), !isUsernameValid)} px-3`}
          />

          {/* Capital letters alert & quick-fix button */}
          {/[A-Z]/.test(form.email) && (
            <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300 animate-fade-in">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0 text-amber-400" />
                Capital letters detected! Emails must be lowercase.
              </span>
              <button
                type="button"
                onClick={() => {
                  setField("email", form.email.toLowerCase());
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="shrink-0 rounded bg-amber-500/20 px-2 py-0.5 text-2xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
              >
                Convert to lowercase
              </button>
            </div>
          )}

          {fieldErrors.email && !/[A-Z]/.test(form.email) && (
            <p id="reg-email-error" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
              {fieldErrors.email}
            </p>
          )}

          {!fieldErrors.email && !/[A-Z]/.test(form.email) && (
            <p id="reg-email-helper" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Enter a valid lowercase email address.
            </p>
          )}
        </div>

        {/* Step 4: Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="reg-password"
              className={`block text-sm font-medium ${isEmailValid ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              Password
            </label>
            {!isEmailValid ? (
              <span className="flex items-center gap-1 text-2xs text-zinc-400">
                <Lock className="size-2.5" /> Complete email first
              </span>
            ) : isPasswordValid ? (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" /> Ready
              </span>
            ) : null}
          </div>
          <div onFocus={() => handleFieldFocus("password")}>
            <PasswordInput
              ref={passwordInputRef}
              id="reg-password"
              name="password"
              autoComplete="new-password"
              required
              disabled={!isEmailValid}
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={handleBlur("password")}
              placeholder="At least 8 characters with letter & number"
              errorText={fieldErrors.password || undefined}
            />
          </div>
          {isEmailValid && <StrengthMeter password={form.password} score={passwordScore} />}
        </div>

        {/* Step 5: Confirm Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="reg-confirm-password"
              className={`block text-sm font-medium ${isPasswordValid ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"}`}
            >
              Confirm Password
            </label>
            {!isPasswordValid ? (
              <span className="flex items-center gap-1 text-2xs text-zinc-400">
                <Lock className="size-2.5" /> Complete password first
              </span>
            ) : isConfirmPasswordValid ? (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" /> Passwords match
              </span>
            ) : null}
          </div>
          <div onFocus={() => handleFieldFocus("confirmPassword")}>
            <PasswordInput
              ref={confirmPasswordInputRef}
              id="reg-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              disabled={!isPasswordValid}
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              onBlur={handleBlur("confirmPassword")}
              placeholder="Re-enter your password"
              errorText={fieldErrors.confirmPassword || undefined}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!allValid || submitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-fast hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-600/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="!text-white" />
              <span>Creating account & sending verification…</span>
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
