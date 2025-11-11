import React, { createContext, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ToastCtx = createContext({ add: () => {} });
export const useToast = () => useContext(ToastCtx);

let idSeq = 1;

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const api = useMemo(() => ({
    add(msg, type = "info", ms = 2500) {
      const id = idSeq++;
      setItems(s => [...s, { id, msg, type }]);
      if (ms) setTimeout(() => remove(id), ms);
    }
  }), []);

  function remove(id) { setItems(s => s.filter(x => x.id !== id)); }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(
        <div className="toasts">
          {items.map(t => (
            <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
              {t.msg}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}
