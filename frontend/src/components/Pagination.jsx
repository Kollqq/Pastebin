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
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 12 }}>
      <button onClick={() => go(page - 1)} disabled={page <= 1}>Prev</button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            style={{
              fontWeight: p === page ? 700 : 400,
              textDecoration: p === page ? "underline" : "none",
              padding: "2px 6px"
            }}
          >
            {p}
          </button>
        )
      )}
      <button onClick={() => go(page + 1)} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
