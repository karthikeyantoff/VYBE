import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Bell,
  Bookmark,
  User as UserIcon,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/useAuth.js";
import { useNotifications } from "../../context/useNotifications.js";
import Avatar from "../ui/Avatar.jsx";
import { cn } from "../../utils/cn.js";

const navItemClass = ({ isActive }) =>
  cn(
    "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-fast",
    isActive
      ? "bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/20 shadow-xs"
      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60"
  );

export default function LeftSidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      aria-label="Sidebar navigation"
      className="flex flex-col justify-between h-full py-2 select-none"
    >
      {/* Primary Navigation Links */}
      <div className="space-y-6">
        <nav className="flex flex-col space-y-1.5" aria-label="Main sidebar">
          <NavLink to="/" end className={navItemClass}>
            <Home className="size-5 shrink-0" aria-hidden="true" />
            <span>Feed</span>
          </NavLink>

          <NavLink to="/explore" className={navItemClass}>
            <Compass className="size-5 shrink-0" aria-hidden="true" />
            <span>Explore</span>
          </NavLink>

          <NavLink to="/notifications" className={navItemClass}>
            <div className="relative shrink-0">
              <Bell className="size-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/saved" className={navItemClass}>
            <Bookmark className="size-5 shrink-0" aria-hidden="true" />
            <span>Saved</span>
          </NavLink>

          <NavLink to={`/u/${user.username}`} className={navItemClass}>
            <UserIcon className="size-5 shrink-0" aria-hidden="true" />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/settings/account" className={navItemClass}>
            <Settings className="size-5 shrink-0" aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Create Post Action CTA */}
        <Link
          to="/posts/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-fast hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-600/35 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>New Post</span>
        </Link>
      </div>

      {/* User Footer Card */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60">
          <Link
            to={`/u/${user.username}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <Avatar
              src={user.avatar}
              name={user.name}
              username={user.username}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {user.name || user.username}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                @{user.username}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
