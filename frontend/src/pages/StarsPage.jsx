import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listStars } from "../api/pastes";

export default function StarsPage() {
  const [items, setItems] = useState([]);

  useEffect(()=>{
    listStars().then(setItems);
  },[]);

  return (
    <div>
      <h2>Your stars</h2>
      <ul>
        {items.map(s => (
          <li key={s.id}>
            <Link to={`/pastes/${s.paste}`}>Paste #{s.paste}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
