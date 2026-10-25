import { useEffect, useState } from "react";
import {
  Search,
  Shield,
  Ban,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Filter,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from "../services/adminService.js";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'admin' | 'active' | 'banned'

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ page, q: query });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, query]);

  const handleRoleToggle = async (user) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    if (
      !confirm(
        `Are you sure you want to change @${user.username}'s role to ${nextRole}?`
      )
    )
      return;

    try {
      await updateUserRole(user._id, nextRole);
      toast.success(`Updated @${user.username} to ${nextRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const handleStatusToggle = async (user) => {
    const action = user.isActive ? "ban" : "activate";
    if (!confirm(`Are you sure you want to ${action} @${user.username}?`)) return;

    try {
      await toggleUserStatus(user._id);
      toast.success(`User ${action}ed successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (user) => {
    if (
      !confirm(
        `PERMANENT ACTION: Delete @${user.username}? This will cascade delete their posts, comments, and notifications.`
      )
    )
      return;

    try {
      await deleteUser(user._id);
      toast.success(`Deleted @${user.username}`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeFilter === "admin") return u.role === "admin";
    if (activeFilter === "active") return u.isActive;
    if (activeFilter === "banned") return !u.isActive;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            User <span className="admin-gradient-text">Management</span>
          </h1>
          <p className="text-xs text-[#A7A0BE] mt-1">
            Total registered accounts in VYBE_db:{" "}
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
            placeholder="Search username, name, email..."
            className="w-full rounded-xl border border-white/10 bg-[#1B1827] py-2.5 pl-10 pr-3.5 text-xs text-[#F3F0FA] placeholder-[#554E6E] focus:border-purple-400 focus:bg-[#221F32] focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: `All Users (${total})` },
          { id: "admin", label: "Admins & Staff" },
          { id: "active", label: "Active" },
          { id: "banned", label: "Banned" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "border border-white/5 bg-[#1B1827] text-[#A7A0BE] hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="admin-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#13111C]/80 border-b border-white/5 text-[#787095] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-5">User Account</th>
                <th className="py-4 px-5">Email Address</th>
                <th className="py-4 px-5">Role Permission</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#A7A0BE]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#787095]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="size-4 animate-spin text-purple-400" />
                      <span>Loading records from Atlas VYBE_db...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.03] transition-colors">
                    {/* User profile with initials avatar */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/40 to-indigo-600/40 text-purple-200 font-bold text-xs border border-purple-500/30">
                          {(u.name || u.username)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {u.name || u.username}
                          </p>
                          <p className="text-[11px] text-[#787095] truncate">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-5 font-mono text-[11px] text-[#C8C3DC]">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-white/5 text-[#787095] border border-white/5"
                        }`}
                      >
                        {u.role === "admin" && <Shield className="size-2.5" />}
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {u.isActive ? "Active" : "Banned"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRoleToggle(u)}
                          title={`Toggle ${u.role === "admin" ? "User" : "Admin"} role`}
                          className="rounded-xl p-2 text-[#A7A0BE] hover:bg-purple-600/20 hover:text-purple-300 transition-colors border border-transparent hover:border-purple-500/20"
                        >
                          <Shield className="size-4" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(u)}
                          title={u.isActive ? "Ban user account" : "Re-activate user account"}
                          className={`rounded-xl p-2 transition-colors border border-transparent ${
                            u.isActive
                              ? "text-[#A7A0BE] hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/20"
                              : "text-amber-400 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/20"
                          }`}
                        >
                          <Ban className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          title="Permanently cascade delete user"
                          className="rounded-xl p-2 text-[#A7A0BE] hover:bg-rose-500/20 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#787095]">
                    No accounts found matching your query.
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
