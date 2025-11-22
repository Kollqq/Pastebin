import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useSession } from "../components/SessionProvider.jsx";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { refresh: refreshSession } = useSession();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { access, refresh: refreshToken } = await login({ username, password });
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refreshToken);
      await refreshSession();
      navigate("/");
    } catch (e) {
      setErr("Invalid login details");
    }
  }

  return (
    <form onSubmit={submit} className="form-card glass-card">
      <div className="form-header">
        <h2>Welcome back</h2>
        <p>Sign in to manage your pastes and track stats.</p>
      </div>
      <input placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      {err && <div className="form-error">{err}</div>}
      <button className="btn primary">Sign in</button>
    </form>
  );
}
