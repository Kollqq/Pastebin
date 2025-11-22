import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import Select from "./Select.jsx";
import { useSession } from "./SessionProvider.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const { theme, setTheme } = useTheme();

  const isAuth = !!user;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar glass-card">
      <Link to="/" className="navbar-brand" aria-label="Go to home page">
        <span className="brand-mark">P</span>
        <span className="brand-text">Pastebin</span>
      </Link>

      <nav className="navbar-links" aria-label="Primary">
        <Link to="/" className="nav-link">Pastes</Link>
        <Link to="/trending" className="nav-link">Trending</Link>
        {isAuth && <Link to="/stats" className="nav-link">Stats</Link>}
        {isAuth && <Link to="/my-pastes" className="nav-link">My pastes</Link>}
        {isAuth && <Link to="/stars" className="nav-link">Stars</Link>}
        {user?.is_staff && <Link to="/admin/pastes" className="nav-link">Admin</Link>}
      </nav>

      <div className="navbar-actions">
        <label className="theme-switcher">
          <span>Theme</span>
          <Select
            size="sm"
            name="theme"
            value={theme}
            onChange={(val) => setTheme(val)}
            aria-label="Select color theme"
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </label>

        {!isAuth ? (
          <div className="navbar-auth">
            <Link to="/login" className="btn ghost">Login</Link>
            <Link to="/register" className="btn primary">Sign up</Link>
          </div>
        ) : (
          <button onClick={handleLogout} className="btn primary">Logout</button>
        )}
      </div>
    </header>
  );
}
