import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending } from "../api/pastes";
import Spinner from "../components/Spinner";

export default function TrendingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getTrending().then((data)=>{ setItems(data); setLoading(false); });
  },[]);

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Trending</h1>
          <p className="page-subtitle">Most viewed pastes from the last 24 hours.</p>
        </div>
      </div>
      <ul className="list-card glass-card">
        {items.map(p => (
          <li key={p.id}>
            <Link to={`/pastes/${p.id}`} className="list-card-link">
              <span className="list-title">{p.title || `Paste #${p.id}`}</span>
              <span className="list-meta">
                {p.owner_username || "unknown"}
                {typeof p.views === "number" && ` · ${p.views} views`}
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="list-empty">No popular pastes</li>}
      </ul>
    </section>
  );
}
