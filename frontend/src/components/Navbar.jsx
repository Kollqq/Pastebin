import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuth = !!localStorage.getItem("access");

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", gap: 12, padding: 8, borderBottom: "1px solid #eee" }}>
      <Link to="/">Pastes</Link>
      {isAuth && <Link to="/new">New</Link>}
      {isAuth && <Link to="/stars">Stars</Link>}
      <span style={{ flex: 1 }} />
      {!isAuth ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  );
}
