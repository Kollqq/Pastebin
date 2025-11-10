import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPastes } from "../api/pastes";

export default function PasteListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    listPastes().then((data)=>{
      setItems(data.results || data); // пагинация DRF
      setLoading(false);
    });
  },[]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Pastes</h2>
      <ul>
        {items.map(p => (
          <li key={p.id}>
            <Link to={`/pastes/${p.id}`}>
              {p.title || `Paste #${p.id}`} — {p.owner_username} ({p.visibility})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
