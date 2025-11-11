import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <section className="form-card glass-card centered-card">
      <h2>404 — Страница не найдена</h2>
      <p>Похоже, вы попали в пустоту. Вернитесь на главную страницу.</p>
      <Link to="/" className="btn primary">На главную</Link>
    </section>
  );
}
