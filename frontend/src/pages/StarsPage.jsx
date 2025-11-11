import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listStars } from "../api/pastes";

export default function StarsPage() {
  const [items, setItems] = useState([]);

  useEffect(()=>{
    listStars().then(setItems);
  },[]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Избранные пасты</h1>
          <p className="page-subtitle">Быстрый доступ к сохранённым сниппетам.</p>
        </div>
      </div>
      <ul className="list-card glass-card">
        {items.map(s => (
          <li key={s.id}>
            <Link to={`/pastes/${s.paste}`} className="list-card-link">Paste #{s.paste}</Link>
          </li>
        ))}
        {items.length === 0 && <li className="list-empty">Нет сохранённых паст</li>}
      </ul>
    </section>
  );
}
