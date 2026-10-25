import { useEffect, useState } from "react";
import {
  Users,
  Newspaper,
  MessageSquare,
  Heart,
  TrendingUp,
  ShieldAlert,
  Award,
  RefreshCw,
  Database,
  Cloud,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { getDashboardStats } from "../services/adminService.js";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = () => {
    setRefreshing(true);
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || "Failed to load dashboard metrics."))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-white/5" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-300">
        <ShieldAlert className="mx-auto mb-3 size-10 text-rose-400" />
        <h3 className="text-lg font-bold">Failed to load platform analytics</h3>
        <p className="mt-1 text-xs text-rose-200/80">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
        >
          <RefreshCw className="size-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Visual trend mock data for the 7-day sparkline chart
  const weeklyTrend = [
    { day: "Mon", users: 12, posts: 24 },
    { day: "Tue", users: 19, posts: 38 },
    { day: "Wed", users: 15, posts: 32 },
    { day: "Thu", users: 28, posts: 55 },
    { day: "Fri", users: 34, posts: 72 },
    { day: "Sat", users: 45, posts: 95 },
    { day: "Sun", users: 52, posts: 110 },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Banner & Refresh CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-2xs font-semibold text-purple-300 mb-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB Atlas Cluster Live: cluster0.lsat1p6.mongodb.net</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Platform <span className="admin-gradient-text">Overview</span>
          </h1>
          <p className="text-xs text-[#A7A0BE] mt-1">
            Real-time telemetry and moderation performance for the VYBE network.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1B1827] px-4 py-2.5 text-xs font-semibold text-[#F3F0FA] hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 text-purple-400 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Metrics"}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="admin-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A7A0BE]">
              Total Users
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <Users className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {stats?.users?.total ?? 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-2xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <TrendingUp className="size-3" />
              +{stats?.users?.newLast7Days ?? 0} this week
            </span>
            <span className="text-[#787095]">Registered</span>
          </div>
        </div>

        {/* Total Posts */}
        <div className="admin-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A7A0BE]">
              Total Posts
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
              <Newspaper className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {stats?.posts?.total ?? 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-2xs">
            <span className="text-[#A7A0BE]">
              {stats?.posts?.hidden ?? 0} hidden by staff
            </span>
            <span className="text-sky-400 font-medium">Timeline Feed</span>
          </div>
        </div>

        {/* Total Comments */}
        <div className="admin-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A7A0BE]">
              Comments
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <MessageSquare className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {stats?.comments?.total ?? 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-2xs">
            <span className="text-emerald-400 font-semibold">Active threads</span>
            <span className="text-[#787095]">Discussions</span>
          </div>
        </div>

        {/* Total Likes */}
        <div className="admin-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A7A0BE]">
              Engagements
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <Heart className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">
            {stats?.likes?.total ?? 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-2xs">
            <span className="text-rose-400 font-semibold">Total Likes</span>
            <span className="text-[#787095]">Reactions</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Activity Chart & Infrastructure Matrix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 7-Day Activity Trend Bar Chart */}
        <div className="admin-card rounded-3xl p-6 lg:col-span-2 border border-white/5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-purple-400" />
                <span>Weekly Growth Velocity</span>
              </h2>
              <p className="text-xs text-[#787095] mt-0.5">
                Daily activity surge comparison across the network
              </p>
            </div>
            <div className="flex items-center gap-4 text-2xs">
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="size-2 rounded-full bg-purple-500" /> Posts
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="size-2 rounded-full bg-indigo-500" /> New Users
              </span>
            </div>
          </div>

          {/* Chart Bars */}
          <div className="flex items-end justify-between gap-3 h-44 pt-4 px-2">
            {weeklyTrend.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Posts bar */}
                  <div
                    className="w-1/2 rounded-t-lg bg-gradient-to-t from-purple-700 to-purple-500 transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${Math.min(100, (item.posts / 110) * 100)}%` }}
                    title={`${item.day}: ${item.posts} posts`}
                  />
                  {/* Users bar */}
                  <div
                    className="w-1/2 rounded-t-lg bg-gradient-to-t from-indigo-700 to-indigo-500 transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${Math.min(100, (item.users / 55) * 100)}%` }}
                    title={`${item.day}: ${item.users} users`}
                  />
                </div>
                <span className="text-[11px] font-medium text-[#787095] group-hover:text-white transition-colors">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure & Services Status Matrix */}
        <div className="admin-card rounded-3xl p-6 border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Platform Health</span>
            </h2>
            <p className="text-xs text-[#787095] mt-0.5">Underlying cloud services</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/5 bg-[#13111C]/60 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white font-semibold">
                  <Database className="size-3.5 text-emerald-400" />
                  MongoDB Atlas
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#787095]">VYBE_db cluster active</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#13111C]/60 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white font-semibold">
                  <Cloud className="size-3.5 text-sky-400" />
                  Cloudinary Media
                </span>
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/20">
                  READY
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#787095]">cblqllb4 • avatars & posts</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#13111C]/60 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white font-semibold">
                  <Zap className="size-3.5 text-purple-400" />
                  WebSocket Stream
                </span>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20">
                  ACTIVE
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#787095]">Dual-origin broadcast bus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Creators Leaderboard */}
      <div className="admin-card rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Award className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Top Creator Leaderboard</h2>
              <p className="text-xs text-[#787095]">Community influencers sorted by organic followers</p>
            </div>
          </div>
          <span className="text-xs text-purple-300 font-semibold">
            {stats?.topUsers?.length ?? 0} Creators
          </span>
        </div>

        {stats?.topUsers?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topUsers.map((user, idx) => (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#13111C]/60 p-4 transition-all hover:border-purple-500/30 hover:bg-[#13111C]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold border ${
                      idx === 0
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : idx === 1
                        ? "bg-zinc-300/20 text-zinc-200 border-zinc-400/30"
                        : idx === 2
                        ? "bg-amber-700/20 text-amber-500 border-amber-700/30"
                        : "bg-white/5 text-[#787095] border-white/5"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name || user.username}
                    </p>
                    <p className="truncate text-xs text-[#787095]">@{user.username}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <p className="text-sm font-extrabold text-purple-300">
                    {user.followersCount}
                  </p>
                  <p className="text-[10px] text-[#787095]">Followers</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-[#787095]">
            No users registered in VYBE_db yet.
          </p>
        )}
      </div>
    </div>
  );
}
