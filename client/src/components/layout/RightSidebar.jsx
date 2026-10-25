import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp } from "lucide-react";

import * as userService from "../../services/userService.js";
import Avatar from "../ui/Avatar.jsx";
import FollowButton from "../user/FollowButton.jsx";

const TRENDING_TOPICS = [
  { tag: "#mernstack", category: "Technology", count: "12.4K posts" },
  { tag: "#react19", category: "Frontend", count: "8.1K posts" },
  { tag: "#mongodb", category: "Database", count: "6.9K posts" },
  { tag: "#vybeplatform", category: "Community", count: "4.2K posts" },
];

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userService.getSuggestedUsers(3);
        if (!cancelled && res?.users) {
          setSuggestions(res.users);
        }
      } catch {
        // Soft fail without crashing layout
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFollowChange = (userId, isFollowing) => {
    setSuggestions((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isFollowing } : u))
    );
  };

  return (
    <aside
      aria-label="Discovery and suggestions"
      className="flex flex-col space-y-5 select-none"
    >
      {/* Who to follow card */}
      <section
        aria-labelledby="who-to-follow-heading"
        className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 shadow-xs dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-[#221F30] dark:to-[#1B1926]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <h2
            id="who-to-follow-heading"
            className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100"
          >
            <Sparkles className="size-4 text-brand-500" aria-hidden="true" />
            Who to follow
          </h2>
          <Link
            to="/explore"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Explore
          </Link>
        </div>

        <div className="mt-3 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-1">
                    <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-2.5 w-14 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="h-7 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between gap-2"
              >
                <Link
                  to={`/u/${user.username}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    username={user.username}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-900 group-hover:text-brand-600 dark:text-zinc-100 dark:group-hover:text-brand-400">
                      {user.name || user.username}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                <FollowButton
                  userId={user._id}
                  isFollowing={Boolean(user.isFollowing)}
                  size="sm"
                  onChange={(isFollowing) =>
                    handleFollowChange(user._id, isFollowing)
                  }
                  onRequireAuth={() => navigate("/login")}
                />
              </div>
            ))
          ) : (
            <p className="py-2 text-xs text-zinc-500">No suggestions right now.</p>
          )}
        </div>
      </section>

      {/* Trending Topics card */}
      <section
        aria-labelledby="trending-heading"
        className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 shadow-xs dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-[#221F30] dark:to-[#1B1926]"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <TrendingUp className="size-4 text-brand-500" aria-hidden="true" />
          <h2
            id="trending-heading"
            className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
          >
            Trending on VYBE
          </h2>
        </div>

        <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {TRENDING_TOPICS.map((topic) => (
            <li key={topic.tag}>
              <Link
                to={`/explore?q=${encodeURIComponent(topic.tag)}`}
                className="group flex flex-col py-2.5 transition-colors hover:opacity-80"
              >
                <span className="text-[11px] text-zinc-400">{topic.category}</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-brand-500">
                  {topic.tag}
                </span>
                <span className="text-[11px] text-zinc-500">{topic.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Platform Footer links */}
      <footer className="px-2 text-[11px] text-zinc-500 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a
            href="https://github.com/karthikeyantoff/VYBE"
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            GitHub
          </a>
          <span>·</span>
          <a
            href="/api-docs"
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Swagger API
          </a>
          <span>·</span>
          <Link
            to="/settings/privacy"
            className="hover:underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Privacy
          </Link>
        </div>
        <p className="text-zinc-400 dark:text-zinc-600">
          VYBE Platform © 2026 — High-Scale MERN Architecture
        </p>
      </footer>
    </aside>
  );
}
