import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listPastes, listLanguages } from "../api/pastes";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import Select from "../components/Select.jsx";

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default function PasteListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuth = !!localStorage.getItem("access");

  const initial = useMemo(() => ({
    search: searchParams.get("search") || "",
    language: searchParams.get("language") || "",
    visibility: searchParams.get("visibility") || "",
    ordering: searchParams.get("ordering") || "-created_at",
    page: toInt(searchParams.get("page"), 1),
  }), []);

  const getResponsivePageSize = () => {
    if (typeof window === "undefined") return 12;
    if (window.innerWidth < 640) return 6;
    if (window.innerWidth < 960) return 8;
    return 12;
  };

  const [form, setForm] = useState({
    search: initial.search,
    language: initial.language,
    visibility: initial.visibility,
    ordering: initial.ordering,
  });
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(getResponsivePageSize());
  const hasLoadedOnce = useRef(false);

  const [langs, setLangs] = useState([]);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLanguages()
      .then((data) => setLangs(Array.isArray(data) ? data : []))
      .catch(() => setLangs([]));
  }, []);

  async function load(params) {
    setLoading(true);
    try {
      const data = await listPastes(params);
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
    load({
      search: initial.search || undefined,
      language: initial.language || undefined,
      visibility: initial.visibility || undefined,
      ordering: initial.ordering || undefined,
      page: initial.page,
      page_size: pageSize,
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      setPageSize((prev) => {
        const next = getResponsivePageSize();
        return next === prev ? prev : next;
      });
    };

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!hasLoadedOnce.current) {
      hasLoadedOnce.current = true;
      return;
    }

    setPage(1);
    const sp = new URLSearchParams(searchParams);
    sp.set("page", "1");
    setSearchParams(sp);
    load({
      search: form.search || undefined,
      language: form.language || undefined,
      visibility: form.visibility || undefined,
      ordering: form.ordering || undefined,
      page: 1,
      page_size: pageSize,
    });
  }, [pageSize]);

  function applyFilters(e) {
    e?.preventDefault?.();
    const next = { ...form, page: 1 };
    const sp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v !== "" && v != null) sp.set(k, v); });
    setSearchParams(sp);
    setPage(1);
    load({ ...next, page_size: pageSize });
  }

  function changePage(p) {
    setPage(p);
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    setSearchParams(sp);
    load({
      search: form.search || undefined,
      language: form.language || undefined,
      visibility: form.visibility || undefined,
      ordering: form.ordering || undefined,
      page: p,
      page_size: pageSize,
    });
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

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

  const orderingOptions = [
    { value: "-created_at", label: "Newest"},
    { value: "created_at", label: "Oldest"},
    { value: "-views", label: "Most viewed"},
    { value: "views", label: "Least viewed" },
    { value: "-updated_at", label: "Recently updated" },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Pastes</h1>
          <p className="page-subtitle">Search and share code snippets in one sleek space.</p>
        </div>
        <div className="page-header-actions">
          <Link to={isAuth ? "/new" : "/login"} className="btn primary">Create new paste</Link>
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
            value={form.language}
            onChange={(val) => setForm({ ...form, language: val })}
            options={languageOptions}
          />
          <Select
            value={form.visibility}
            onChange={(val) => setForm({ ...form, visibility: val })}
            options={visibilityOptions}
          />
          <Select
            value={form.ordering}
            onChange={(val) => setForm({ ...form, ordering: val })}
            options={orderingOptions}
          />
          <button className="btn primary">Apply</button>
        </div>
      </form>

      {loading ? (
        <div className="page-loading">
          <Spinner size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-card glass-card">Nothing found. Adjust filters or create a new paste.</div>
      ) : (
        <>
          <ul className="paste-grid">
            {items.map((p) => (
              <li key={p.id} className="paste-card glass-card">
                <div className="paste-card-header">
                  <Link to={`/pastes/${p.id}`} className="paste-card-title">
                    {p.title || `Paste #${p.id}`}
                  </Link>
                  <span className="badge">{p.visibility}</span>
                </div>
                <div className="paste-card-meta">
                  <span>{p.owner_username || "unknown"}</span>
                  {p.language?.name && <span>{p.language.name}</span>}
                  {typeof p.views === "number" && <span>{p.views} views</span>}
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}
    </section>
  );
}
