import React from "react";

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  function go(p) {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  }

  const window = 2;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="pagination">
      <button className="btn ghost" onClick={() => go(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="pagination-ellipsis">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`btn ghost pagination-page${p === page ? " active" : ""}`}
          >
            {p}
          </button>
        )
      )}
      <button className="btn ghost" onClick={() => go(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}
