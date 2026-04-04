import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaTrash, FaBell, FaBellSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import UserNavbar from "../components/UserNavbar";
import { useNotifications } from "../hooks/useNotifications";

const PAGE_LIMIT = 20;

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

const FILTERS = ["all", "unread", "read"];

const NotificationsPage = () => {
  const {
    list, unreadCount, loading, error, pagination,
    fetchNotifications, markOneAsRead, markAllAsRead, deleteOne, fetchUnreadCount,
  } = useNotifications();

  const [filter, setFilter]           = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications({ page: currentPage, limit: PAGE_LIMIT });
  }, [currentPage, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return list.filter((n) => !n.isRead);
    if (filter === "read")   return list.filter((n) =>  n.isRead);
    return list;
  }, [filter, list]);

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / PAGE_LIMIT));

  const onMarkRead = async (id) => {
    const result = await markOneAsRead(id);
    if (result) { toast.success("Marked as read"); fetchUnreadCount(); }
  };

  const onMarkAll = async () => {
    const result = await markAllAsRead();
    if (result) { toast.success("All notifications marked as read"); fetchUnreadCount(); }
  };

  const onDelete = async (id) => {
    const result = await deleteOne(id);
    if (result) {
      toast.success("Notification removed");
      if (filteredNotifications.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchNotifications({ page: currentPage, limit: PAGE_LIMIT });
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <UserNavbar />

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-text-main">Notifications</h1>
          <p className="text-text-muted mt-1.5">Stay on top of your activity and incoming alerts.</p>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Unread",    value: unreadCount, color: "text-primary-600 dark:text-primary-400" },
            { label: "Total",     value: pagination.total || 0, color: "text-text-main" },
            { label: "This Page", value: list.length, color: "text-text-main" },
          ].map((s) => (
            <div key={s.label} className="card-styled p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="inline-flex rounded-xl border border-border-subtle bg-bg-surface p-1 gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                  filter === f
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-text-muted hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onMarkAll}
            disabled={loading || unreadCount === 0}
            className="btn-secondary text-sm py-2 disabled:opacity-40"
          >
            <FaCheck className="text-xs" /> Mark all as read
          </button>
        </div>

        {/* Error / Loading */}
        {error          && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
        {loading && list.length === 0 && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-styled p-5 animate-pulse">
                <div className="h-4 bg-border-subtle rounded w-1/3 mb-3" />
                <div className="h-3 bg-border-subtle rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotifications.length === 0 && (
          <div className="card-styled p-14 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-border-subtle text-text-muted mb-4">
              <FaBellSlash className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-text-main">No notifications here</h3>
            <p className="text-text-muted mt-1 text-sm">
              {filter !== "all" ? `Switch to "all" to see everything` : "You're all caught up!"}
            </p>
          </div>
        )}

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <article
              key={item._id}
              className={`card-styled p-5 transition ${!item.isRead ? "border-primary-400/60 bg-primary-50/50 dark:bg-primary-900/10" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {!item.isRead && (
                      <span className="inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    )}
                    <p className="font-bold text-text-main truncate">{item.title || "Notification"}</p>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{item.body || ""}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span>{formatTime(item.createdAt)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      item.isRead
                        ? "bg-zinc-100 dark:bg-zinc-800 text-text-muted"
                        : "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                    }`}>
                      {item.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(item._id)}
                      className="btn-secondary text-xs py-1.5 px-3 gap-1"
                    >
                      <FaCheck className="text-[10px]" /> Read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(item._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
            <p className="text-sm text-text-muted">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="btn-secondary text-sm py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="btn-secondary text-sm py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
