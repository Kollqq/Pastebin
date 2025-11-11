import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listPastes, listLanguages } from "../api/pastes";
import Pagination from "../components/Pagination";

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default function PasteListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = useMemo(() => ({
    search: searchParams.get("search") || "",
    language: searchParams.get("language") || "",
    visibility: searchParams.get("visibility") || "",
    ordering: searchParams.get("ordering") || "-created_at",
    page: toInt(searchParams.get("page"), 1),
    page_size: toInt(searchParams.get("page_size"), 10),
  }), []);

  const [form, setForm] = useState({
    search: initial.search,
    language: initial.language,
    visibility: initial.visibility,
    ordering: initial.ordering,
  });
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.page_size);

  const [langs, setLangs] = useState([]);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLanguages().then((data) => setLangs(Array.isArray(data) ? data : [])).catch(()=>setLangs([]));
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
      page_size: initial.page_size,
    });
  }, []);

  function applyFilters(e) {
    e?.preventDefault?.();
    const next = {
      ...form,
      page: 1,
      page_size: pageSize,
    };
    const sp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v !== "" && v != null) sp.set(k, v);
    });
    setSearchParams(sp);
    setPage(1);
    load(next);
  }

  function changePage(p) {
    setPage(p);
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    sp.set("page_size", String(pageSize));
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

  return (
    <div>
      <h2>Pastes</h2>

      <form onSubmit={applyFilters} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 160px 160px 180px 110px auto", alignItems: "center" }}>
        <input
          placeholder="search in title/content/owner"
          value={form.search}
          onChange={(e) => setForm({ ...form, search: e.target.value })}
        />
        <select value={form.language} onChange={(e)=>setForm({ ...form, language: e.target.value })}>
          <option value="">Language: any</option>
          {(langs || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={form.visibility} onChange={(e)=>setForm({ ...form, visibility: e.target.value })}>
          <option value="">Visibility: any</option>
          <option value="public">public</option>
          <option value="unlisted">unlisted</option>
          <option value="private">private</option>
        </select>
        <select value={form.ordering} onChange={(e)=>setForm({ ...form, ordering: e.target.value })}>
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
          <option value="-views">Most viewed</option>
          <option value="views">Least viewed</option>
          <option value="-updated_at">Recently updated</option>
          <option value="updated_at">Least recently updated</option>
        </select>
        <select value={pageSize} onChange={(e)=>setPageSize(toInt(e.target.value, 10))}>
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button>Apply</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul style={{ marginTop: 12 }}>
            {items.map(p => (
              <li key={p.id}>
                <Link to={`/pastes/${p.id}`}>
                  {p.title || `Paste #${p.id}`} — {p.owner_username} ({p.visibility})
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}
    </div>
  );
}
