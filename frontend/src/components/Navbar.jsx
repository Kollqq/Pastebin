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
    <div className="navbar">
      <Link to="/">Pastes</Link>
      <Link to="/trending">Trending</Link>
      <Link to="/stats">Stats</Link>
      {isAuth && <Link to="/new">New</Link>}
      {isAuth && <Link to="/stars">Stars</Link>}
      <span className="spacer" />
      {!isAuth ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </div>
  );
}
