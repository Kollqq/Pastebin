import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listMyPastes } from "../api/pastes";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

export default function MyPastesPage() {

  function formatTitle(paste) {
    const base = paste.title || `Paste #${paste.id}`;
    return base.length > 10 ? base.slice(0, 10) + "..." : base;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const pageSize = 12;

  async function load(nextPage = 1) {
    setLoading(true);
    try {
      const data = await listMyPastes({ page: nextPage, page_size: pageSize });
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

  useEffect(() => {
    load(page);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function changePage(p) {
    setPage(p);
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    setSearchParams(sp);
    load(p);
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>My pastes</h1>
          <p className="page-subtitle">Quick overview of everything you've shared.</p>
        </div>
        <div className="page-header-actions">
          <Link to="/new" className="btn primary">Create new paste</Link>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <Spinner size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-card glass-card">
          <div>
            <p>You haven't added any pastes yet.</p>
            <Link to="/new" className="btn primary">Start with your first paste</Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="paste-grid">
            {items.map((p) => (
              <li key={p.id} className="paste-card glass-card">
                <div className="paste-card-header">
                  <div className="paste-card-header-text">
                    <Link to={`/pastes/${p.id}`} className="paste-card-title">
                      {formatTitle(p)}
                    </Link>
                    <div className="paste-card-meta">
                      <span>{p.owner_username || "me"}</span>
                      {p.language?.name && <span>{p.language.name}</span>}
                      {typeof p.views === "number" && (
                          <span className="paste-card-views">{p.views} views</span>
                      )}
                    </div>
                  </div>
                  <span className="badge">{p.visibility}</span>
                </div>

                <div className="paste-card-actions">
                  <Link to={`/edit/${p.id}`} className="btn secondary">Edit</Link>
                  <Link to={`/pastes/${p.id}`} className="btn ghost">Open</Link>
                </div>
                {p.is_removed_by_admin && (
                  <div className="admin-note">
                    <strong>Removed by admin:</strong> {p.admin_removal_comment || "No comment provided"}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}
    </section>
  );
}
