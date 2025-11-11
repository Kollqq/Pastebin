import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuth = !!localStorage.getItem("access");
  const { theme, setTheme } = useTheme();

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  return (
    <header className="navbar glass-card">
      <Link to="/" className="navbar-brand" aria-label="Go to home page">
        <span className="brand-mark">⌘</span>
        <span className="brand-text">Pastebin</span>
      </Link>

      <nav className="navbar-links" aria-label="Primary">
        <Link to="/" className="nav-link">Pastes</Link>
        <Link to="/trending" className="nav-link">Trending</Link>
        <Link to="/stats" className="nav-link">Stats</Link>
        {isAuth && <Link to="/new" className="nav-link">New</Link>}
        {isAuth && <Link to="/stars" className="nav-link">Stars</Link>}
      </nav>

      <div className="navbar-actions">
        <label className="theme-switcher">
          <span>Theme</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            aria-label="Select color theme"
          >
            <option value="system">system</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>

        {!isAuth ? (
          <div className="navbar-auth">
            <Link to="/login" className="btn ghost">Login</Link>
            <Link to="/register" className="btn primary">Sign up</Link>
          </div>
        ) : (
          <button onClick={logout} className="btn primary">Logout</button>
        )}
      </div>
    </header>
  );
}
