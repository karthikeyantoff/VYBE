import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Monitor,
  Moon,
  Sun,
  Zap,
  ShieldCheck,
  Cloud,
  Layers,
  Sparkles,
} from "lucide-react";

import { THEME_STORAGE_KEY } from "../../utils/constants.js";
import logoUrl from "../../assets/logo.svg";
import Logo from "../ui/Logo.jsx";

const THEMES = ["system", "light", "dark"];

const computeIsDark = (mode) => {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
};

const readStoredTheme = () => {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(value) ? value : "system";
};

function GuestThemeToggle() {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", computeIsDark(theme));
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme !== "system") return undefined;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return undefined;
    const onChange = () =>
      document.documentElement.classList.toggle("dark", mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((prev) => THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length]);
  }, []);

  const Icon = theme === "dark" ? Sun : theme === "light" ? Moon : Monitor;
  const label =
    theme === "system"
      ? "Theme: system"
      : theme === "light"
      ? "Theme: light"
      : "Theme: dark";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${label}. Click to change.`}
      className="inline-flex size-9 items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-md ring-1 ring-zinc-200/80 backdrop-blur-md transition-all duration-fast hover:scale-105 hover:bg-white hover:text-zinc-900 dark:bg-zinc-900/80 dark:text-zinc-200 dark:ring-zinc-800 dark:hover:bg-zinc-800"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

function BrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden bg-gradient-to-br from-[#1E1B32] via-[#241E3D] to-[#161324] lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-white border-r border-white/5"
    >
      {/* Ambient background glow orbs */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-purple-600/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 right-0 size-96 rounded-full bg-indigo-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/3 size-64 rounded-full bg-violet-400/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Grid Pattern */}
      <svg
        className="pointer-events-none absolute inset-0 size-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="auth-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 32 V0 H32"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      {/* Header / Brand logo */}
      <div className="relative z-10 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <img src={logoUrl} alt="VYBE" className="h-8 w-auto transition-transform group-hover:scale-105" />
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-2xs font-semibold text-purple-300 backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>VYBE Cluster Active</span>
        </div>
      </div>

      {/* Main Feature Highlights */}
      <div className="relative z-10 max-w-lg space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-purple-200">
            <Sparkles className="size-3.5 text-purple-400" />
            <span>Next-Gen Social Network</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Vibe with the world in <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">real time.</span>
          </h1>
          <p className="text-sm text-purple-100/75 leading-relaxed">
            Experience ultra-fast real-time interactions, crystal clear media sharing,
            and an ad-free timeline crafted with modern engineering.
          </p>
        </div>

        {/* Feature Grid Pills */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
              <Zap className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Live Sockets</p>
              <p className="text-[11px] text-purple-200/60">Sub-50ms sync</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Dynamic Auth</p>
              <p className="text-[11px] text-purple-200/60">Argon2 + JWT</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">
              <Cloud className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Cloudinary CDN</p>
              <p className="text-[11px] text-purple-200/60">Fast image delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Clean UI/UX</p>
              <p className="text-[11px] text-purple-200/60">Minimalist aesthetic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-purple-200/50">
        <p>© {new Date().getFullYear()} VYBE Platform</p>
        <p className="font-mono text-[11px]">v2.4.0-stable</p>
      </div>
    </aside>
  );
}

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative grid min-h-screen bg-[#171522] text-zinc-100 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ambient-glow overflow-x-hidden">
      {/* Top right guest theme button */}
      <div className="absolute right-4 top-4 z-20">
        <GuestThemeToggle />
      </div>

      <BrandPanel />

      <main className="relative flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        {/* Subtle background glow circle behind form */}
        <div
          className="pointer-events-none absolute size-96 rounded-full bg-purple-600/10 blur-3xl -z-10"
          aria-hidden="true"
        />

        <div className="w-full max-w-md">
          <Link
            to="/"
            aria-label="VYBE home"
            className="mb-8 inline-flex items-center lg:hidden transition-transform hover:scale-105"
          >
            <Logo wordmark className="h-7 w-auto" />
          </Link>

          <section
            aria-labelledby="auth-title"
            className="motion-safe:animate-fade-up rounded-3xl border border-purple-500/20 bg-[#22202E]/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
          >
            <header className="mb-6 space-y-1.5">
              <h2
                id="auth-title"
                className="text-2xl font-bold tracking-tight text-[#F3F0FA]"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[#A7A0B8]">
                  {subtitle}
                </p>
              )}
            </header>

            {children}
          </section>

          {footer && (
            <p className="mt-6 text-center text-sm text-[#A7A0B8]">
              {footer}
            </p>
          )}

          <p className="mt-6 text-center text-xs text-[#78708F]">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline decoration-dotted underline-offset-2 hover:text-purple-300"
            >
              Terms of Service
            </a>
            .
          </p>

          <p className="mt-4 text-center text-xs text-[#78708F]">
            VYBE Social Platform • Secured by Dynamic Session JWT
          </p>
        </div>
      </main>
    </div>
  );
}
