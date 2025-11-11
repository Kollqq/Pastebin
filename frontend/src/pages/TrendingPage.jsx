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
          <h1>В тренде</h1>
          <p className="page-subtitle">Самые просматриваемые пасты за последние 24 часа.</p>
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
        {items.length === 0 && <li className="list-empty">Нет популярных паст</li>}
      </ul>
    </section>
  );
}
