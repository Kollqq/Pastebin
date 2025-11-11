import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeCtx = createContext({ theme: "system", setTheme: () => {} });
export const useTheme = () => useContext(ThemeCtx);

const KEY = "theme";

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || "system");

  // применяем тему к <html data-theme="...">
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
