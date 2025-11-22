import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminRemovePaste, listLanguages, listPastes } from "../api/pastes";
import Select from "../components/Select.jsx";
import Pagination from "../components/Pagination.jsx";
import Spinner from "../components/Spinner.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { useSession } from "../components/SessionProvider.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function AdminPastesPage() {
  const { user } = useSession();
  const toast = useToast();
  const [form, setForm] = useState({ search: "", visibility: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [langs, setLangs] = useState([]);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [removalComment, setRemovalComment] = useState("");

  useEffect(() => {
    listLanguages().then((data) => setLangs(Array.isArray(data) ? data : [])).catch(() => setLangs([]));
  }, []);

  useEffect(() => {
    if (!user?.is_staff) return;
    load(1);
  }, [user]);

  async function load(nextPage = 1, overrides = {}) {
    setLoading(true);
    try {
      const data = await listPastes({
        ...form,
        ...overrides,
        page: nextPage,
        page_size: pageSize,
      });
      setItems(data.results || []);
      setCount(data.count ?? (data.results?.length || 0));
    } catch (e) {
      console.error(e);
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  function changePage(p) {
    setPage(p);
    load(p);
  }

  async function applyFilters(e) {
    e?.preventDefault?.();
    setPage(1);
    await load(1);
  }

  async function confirmAdminRemoval() {
    if (!pendingRemoval) return;
    try {
      const updated = await adminRemovePaste(pendingRemoval.id, removalComment);
      setItems((prev) => prev.map((p) => (p.id === pendingRemoval.id ? updated : p)));
      toast.add("Paste removed for the user", "success");
    } catch (err) {
      console.error(err);
      toast.add("Failed to remove paste", "error");
    } finally {
      setPendingRemoval(null);
      setRemovalComment("");
    }
  }

  const languageOptions = useMemo(
    () => [
      { value: "", label: "Language" },
      ...(langs || []).map((l) => ({ value: String(l.id), label: l.name })),
    ],
    [langs],
  );

  const visibilityOptions = [
    { value: "", label: "Visibility" },
    { value: "public", label: "public" },
    { value: "unlisted", label: "unlisted" },
    { value: "private", label: "private" },
  ];

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (!user?.is_staff) {
    return (
      <section className="page">
        <div className="empty-card glass-card">
          Admin access required to view this page.
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Admin paste search</h1>
          <p className="page-subtitle">Find any paste and leave a removal note for its owner.</p>
        </div>
      </div>

      <form onSubmit={applyFilters} className="filter-card glass-card">
        <div className="filter-grid">
          <input
            placeholder="Search by title"
            value={form.search}
            onChange={(e) => setForm({ ...form, search: e.target.value })}
          />
          <Select
            value={form.visibility}
            onChange={(val) => setForm({ ...form, visibility: val })}
            options={visibilityOptions}
          />
          <Select
            value={form.language || ""}
            onChange={(val) => setForm({ ...form, language: val })}
            options={languageOptions}
          />
          <div className="filter-actions">
            <button className="btn primary" type="submit">Apply</button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="page-loading">
          <Spinner size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-card glass-card">No pastes found.</div>
      ) : (
        <>
          <ul className="paste-grid">
            {items.map((p) => (
              <li key={p.id} className="paste-card glass-card">
                <div className="paste-card-header">
                  <div className="paste-card-header-text">
                    <Link to={`/pastes/${p.id}`} className="paste-card-title">
                      {p.title || `Paste #${p.id}`}
                    </Link>
                    <div className="paste-card-meta">
                      <span>{p.owner_username || "unknown"}</span>
                      {p.language?.name && <span>{p.language.name}</span>}
                    </div>
                  </div>
                  <span className={`badge${p.is_removed_by_admin ? " removed" : ""}`}>
                    {p.is_removed_by_admin ? "Removed" : p.visibility}
                  </span>
                </div>
                {p.is_removed_by_admin && (
                  <div className="admin-note">
                    <strong>Admin note:</strong> {p.admin_removal_comment || "No comment"}
                  </div>
                )}
                <div className="paste-card-actions">
                  <Link to={`/pastes/${p.id}`} className="btn secondary">Open</Link>
                  {!p.is_removed_by_admin && (
                    <button
                      onClick={() => {
                        setPendingRemoval(p);
                        setRemovalComment("");
                      }}
                      className="btn danger"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}

      <ConfirmModal
        open={Boolean(pendingRemoval)}
        title="Remove paste?"
        description="Leave a note for the owner."
        confirmLabel="Remove"
        onConfirm={confirmAdminRemoval}
        onCancel={() => {
          setPendingRemoval(null);
          setRemovalComment("");
        }}
      >
        <label className="modal-input-label" htmlFor="admin-removal-comment">
          Comment for the owner
        </label>
        <textarea
          id="admin-removal-comment"
          placeholder="Reason for removal..."
          value={removalComment}
          onChange={(e) => setRemovalComment(e.target.value)}
        />
      </ConfirmModal>
    </section>
  );
}
