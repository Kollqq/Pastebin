import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../api/auth";

const SessionContext = createContext({ user: null, loading: false, refresh: () => {}, logout: () => {} });

export default function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadUser() {
    const access = localStorage.getItem("access");
    if (!access) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (e) {
      console.error(e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  useEffect(() => {
    loadUser();
  }, []);

  const value = useMemo(() => ({ user, loading, refresh: loadUser, logout }), [user, loading]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
