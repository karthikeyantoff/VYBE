import { useEffect, useState } from "react";
import { Search, Eye, EyeOff, Trash2, Heart, MessageSquare, Newspaper, RefreshCw, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminPosts, togglePostHidden, deletePost } from "../services/adminService.js";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'visible' | 'hidden'

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAdminPosts({ page, q: query });
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, query]);

  const handleToggleHidden = async (post) => {
    const action = post.isHidden ? "unhide" : "hide";
    try {
      await togglePostHidden(post._id);
      toast.success(`Post ${action}d successfully`);
      fetchPosts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle post visibility");
    }
  };

  const handleDelete = async (post) => {
    if (!confirm("Are you sure you want to permanently delete this post?")) return;

    try {
      await deletePost(post._id);
      toast.success("Post permanently removed");
      fetchPosts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === "visible") return !p.isHidden;
    if (filter === "hidden") return p.isHidden;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Post <span className="admin-gradient-text">Moderation</span>
          </h1>
          <p className="text-xs text-[#A7A0BE] mt-1">
            Total timeline posts indexed in VYBE_db:{" "}
            <span className="font-semibold text-purple-300">{total}</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#787095]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search post content..."
            className="w-full rounded-xl border border-white/10 bg-[#1B1827] py-2.5 pl-10 pr-3.5 text-xs text-[#F3F0FA] placeholder-[#554E6E] focus:border-purple-400 focus:bg-[#221F32] focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: `All Posts (${total})` },
          { id: "visible", label: "Visible on Feed" },
          { id: "hidden", label: "Hidden by Staff" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === tab.id
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "border border-white/5 bg-[#1B1827] text-[#A7A0BE] hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="admin-card rounded-3xl p-10 text-center text-xs text-[#787095] border border-white/5">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="size-4 animate-spin text-purple-400" />
              <span>Querying posts from VYBE_db...</span>
            </div>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((p) => (
            <div
              key={p._id}
              className={`admin-card rounded-3xl p-5 border transition-all ${
                p.isHidden
                  ? "border-amber-500/30 bg-[#221B27]/80"
                  : "border-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 min-w-0 flex-1">
                  {/* Author Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 text-purple-300 font-bold text-xs border border-purple-500/20">
                      {(p.author?.name || p.author?.username || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {p.author?.name || p.author?.username || "Unknown"}
                        </span>
                        <span className="text-[11px] text-[#787095]">
                          @{p.author?.username}
                        </span>
                        {p.isHidden && (
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider border border-amber-500/30">
                            Hidden from Feed
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#787095]">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-[#E3E0EE] leading-relaxed whitespace-pre-wrap pl-12">
                    {p.content}
                  </p>

                  {/* Image attachment if exists */}
                  {p.image?.url && (
                    <div className="pl-12">
                      <div className="relative inline-block max-w-sm rounded-2xl overflow-hidden border border-white/10 group">
                        <img
                          src={p.image.url}
                          alt="Post media"
                          className="max-h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <a
                          href={p.image.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Engagements bar */}
                  <div className="flex items-center gap-4 text-2xs text-[#787095] pl-12 pt-1">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-rose-300">
                      <Heart className="size-3 text-rose-400" />
                      {p.likesCount || 0} Likes
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-amber-300">
                      <MessageSquare className="size-3 text-amber-400" />
                      {p.commentsCount || 0} Comments
                    </span>
                    <span className="font-mono text-[10px] text-[#554E6E]">
                      ID: {p._id}
                    </span>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleHidden(p)}
                    title={p.isHidden ? "Restore post to feed" : "Hide post from feed"}
                    className={`rounded-xl p-2.5 transition-all border ${
                      p.isHidden
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                        : "bg-white/5 text-[#A7A0BE] border-white/5 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {p.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    title="Delete post permanently"
                    className="rounded-xl p-2.5 bg-white/5 text-[#A7A0BE] border border-white/5 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="admin-card rounded-3xl p-10 text-center text-xs text-[#787095] border border-white/5">
            No posts found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#1B1827] px-5 py-3 text-xs text-[#787095]">
        <span>
          Showing page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-white/5 bg-[#13111C] px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-40 transition-all"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-white/5 bg-[#13111C] px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-40 transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
