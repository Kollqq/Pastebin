import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../api/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ username:"", email:"", password:"" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(form);
      const { access, refresh } = await login({ username: form.username, password: form.password });
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      navigate("/");
    } catch (e) {
      setErr("Registration failed");
    }
  }

  return (
    <form onSubmit={submit} className="form-card glass-card">
      <div className="form-header">
        <h2>Create an account</h2>
        <p>Get quick access to favorite pastes and advanced features.</p>
      </div>
      <input name="username" placeholder="username" value={form.username} onChange={onChange} />
      <input name="email" placeholder="email" value={form.email} onChange={onChange} />
      <input name="password" placeholder="password" type="password" value={form.password} onChange={onChange} />
      {err && <div className="form-error">{err}</div>}
      <button className="btn primary">Create account</button>
    </form>
  );
}
