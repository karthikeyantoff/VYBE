import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  MessageSquare,
  LogOut,
  Shield,
  ExternalLink,
  Activity,
  Database,
  Cloud,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/users", label: "User Management", icon: Users },
  { to: "/posts", label: "Post Moderation", icon: Newspaper },
  { to: "/comments", label: "Comments", icon: MessageSquare },
];

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentNav = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || NAV_ITEMS[0];

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-purple-600/25 to-indigo-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
        : "text-[#A7A0BE] hover:text-[#F3F0FA] hover:bg-white/5"
    }`;

  return (
    <div className="flex min-h-screen bg-[#13111C] text-[#F3F0FA] admin-ambient-glow">
      {/* Left Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-r border-white/5 bg-[#1B1827]/90 backdrop-blur-xl p-4 shrink-0 z-20">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-600/30">
              V
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500 border border-[#1B1827]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[#F3F0FA]">
                  VYBE ADMIN
                </span>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 uppercase tracking-wider border border-purple-500/30">
                  Staff
                </span>
              </div>
              <p className="text-[11px] text-[#787095]">Master Command Hub</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* System Environment Monitor Card */}
          <div className="rounded-2xl border border-white/5 bg-[#13111C]/60 p-3.5 space-y-2.5">
            <p className="text-2xs font-semibold text-[#787095] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="size-3 text-purple-400" />
              <span>Live Cluster Status</span>
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#A7A0BE]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Database className="size-3 text-emerald-400" /> Atlas DB
                </span>
                <span className="text-[10px] font-mono text-emerald-400">VYBE_db</span>
              </div>
              <div className="flex items-center justify-between text-[#A7A0BE]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Cloud className="size-3 text-sky-400" /> Cloudinary
                </span>
                <span className="text-[10px] font-mono text-sky-400">cblqllb4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="space-y-3 border-t border-white/5 pt-4">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl p-2.5 text-xs text-[#A7A0BE] hover:bg-white/5 hover:text-[#F3F0FA] transition-colors border border-white/5"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="size-3.5 text-purple-400" />
              Launch Main Site
            </span>
            <span className="text-[10px] text-purple-300 font-mono">:5173</span>
          </a>

          <div className="flex items-center justify-between rounded-xl bg-[#13111C]/80 p-2.5 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/20">
                {(adminUser?.name || "A")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#F3F0FA]">
                  {adminUser?.name || "Administrator"}
                </p>
                <p className="truncate text-[10px] text-[#787095]">
                  @{adminUser?.username || "admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="rounded-lg p-1.5 text-[#A7A0BE] hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-[#1B1827]/80 backdrop-blur-xl px-6 sm:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-[#787095]">Admin</span>
            <span className="text-[#554E6E]">/</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <currentNav.icon className="size-4 text-purple-400" />
              {currentNav.label}
            </span>
          </div>

          {/* Right Header Status info */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-[#787095]">
              <Clock className="size-3.5 text-purple-400" />
              <span className="font-mono text-[11px]">{currentTime}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-2xs font-semibold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production API :5000</span>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
