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
    <div className="navbar">
      <Link to="/">Pastes</Link>
      <Link to="/trending">Trending</Link>
      <Link to="/stats">Stats</Link>
      {isAuth && <Link to="/new">New</Link>}
      {isAuth && <Link to="/stars">Stars</Link>}
      <span className="spacer" />

      <label aria-label="Theme selector" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, opacity: .8 }}>Theme:</span>
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
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={logout} className="btn">Logout</button>
      )}
    </div>
  );
}
