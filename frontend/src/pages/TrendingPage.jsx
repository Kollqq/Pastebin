import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending } from "../api/pastes";

export default function TrendingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getTrending().then((data)=>{ setItems(data); setLoading(false); });
  },[]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Trending (last 24h)</h2>
      <ul>
        {items.map(p => (
          <li key={p.id}>
            <Link to={`/pastes/${p.id}`}>
              {p.title || `Paste #${p.id}`} — {p.owner_username} (views: {p.views})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
