import { useEffect, useState } from "react";
import { Search, Trash2, MessageSquare, RefreshCw, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminComments, deleteComment } from "../services/adminService.js";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getAdminComments({ page, q: query });
      setComments(data.comments || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComments();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, query]);

  const handleDelete = async (comment) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;

    try {
      await deleteComment(comment._id);
      toast.success("Comment deleted successfully");
      fetchComments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Comment <span className="admin-gradient-text">Moderation</span>
          </h1>
          <p className="text-xs text-[#A7A0BE] mt-1">
            Total active discussion comments in threads:{" "}
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
            placeholder="Search comment content..."
            className="w-full rounded-xl border border-white/10 bg-[#1B1827] py-2.5 pl-10 pr-3.5 text-xs text-[#F3F0FA] placeholder-[#554E6E] focus:border-purple-400 focus:bg-[#221F32] focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Comments Table Card */}
      <div className="admin-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#13111C]/80 border-b border-white/5 text-[#787095] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-5">Comment Author</th>
                <th className="py-4 px-5">Message Text</th>
                <th className="py-4 px-5">Posted Date</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#A7A0BE]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[#787095]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="size-4 animate-spin text-purple-400" />
                      <span>Fetching comments from VYBE_db...</span>
                    </div>
                  </td>
                </tr>
              ) : comments.length > 0 ? (
                comments.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Author */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/30 text-purple-300 font-bold text-xs border border-purple-500/20">
                          {(c.author?.name || c.author?.username || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {c.author?.name || c.author?.username}
                          </p>
                          <p className="text-[11px] text-[#787095]">@{c.author?.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="py-4 px-5">
                      <p className="text-[#E3E0EE] leading-relaxed line-clamp-2">
                        {c.content}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 whitespace-nowrap text-[11px] text-[#787095]">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDelete(c)}
                        title="Delete comment permanently"
                        className="rounded-xl p-2 text-[#A7A0BE] hover:bg-rose-500/20 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[#787095]">
                    No comments found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-white/5 bg-[#13111C]/60 px-5 py-3 text-xs text-[#787095]">
          <span>
            Showing page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-white/5 bg-[#1B1827] px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-white/5 bg-[#1B1827] px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
