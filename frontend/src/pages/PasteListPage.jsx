import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPastes, listLanguages } from "../api/pastes";

export default function PasteListPage() {
  const [items, setItems] = useState([]);
  const [langs, setLangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ search: "", language: "", visibility: "", ordering: "-created_at" });

useEffect(() => {
  listLanguages().then((data) => {
    setLangs(Array.isArray(data) ? data : data.results || []);
  });
}, []);

  async function load() {
    setLoading(true);
    const params = {};
    if (query.search) params.search = query.search;
    if (query.language) params.language = query.language;
    if (query.visibility) params.visibility = query.visibility;
    if (query.ordering) params.ordering = query.ordering;

    const data = await listPastes(params);
    setItems(data.results || data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function onSubmit(e) { e.preventDefault(); load(); }

  return (
    <div>
      <h2>Pastes</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 160px 160px 180px auto", alignItems: "center" }}>
        <input
          placeholder="search in title/content/owner"
          value={query.search}
          onChange={(e) => setQuery({ ...query, search: e.target.value })}
        />
        <select value={query.language} onChange={(e)=>setQuery({ ...query, language: e.target.value })}>
          <option value="">Language: any</option>
          {langs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={query.visibility} onChange={(e)=>setQuery({ ...query, visibility: e.target.value })}>
          <option value="">Visibility: any</option>
          <option value="public">public</option>
          <option value="unlisted">unlisted</option>
          <option value="private">private</option>
        </select>
        <select value={query.ordering} onChange={(e)=>setQuery({ ...query, ordering: e.target.value })}>
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
          <option value="-views">Most viewed</option>
          <option value="views">Least viewed</option>
          <option value="-updated_at">Recently updated</option>
          <option value="updated_at">Least recently updated</option>
        </select>
        <button>Apply</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul style={{ marginTop: 12 }}>
          {items.map(p => (
            <li key={p.id}>
              <Link to={`/pastes/${p.id}`}>
                {p.title || `Paste #${p.id}`} — {p.owner_username} ({p.visibility})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
