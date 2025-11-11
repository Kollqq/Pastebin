import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { access, refresh } = await login({ username, password });
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      navigate("/");
    } catch (e) {
      setErr("Неверные данные для входа");
    }
  }

  return (
    <form onSubmit={submit} className="form-card glass-card">
      <div className="form-header">
        <h2>С возвращением</h2>
        <p>Войдите, чтобы управлять своими пастами и отслеживать статистику.</p>
      </div>
      <input placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      {err && <div className="form-error">{err}</div>}
      <button className="btn primary">Sign in</button>
    </form>
  );
}
