import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <section className="form-card glass-card centered-card">
      <h2>404 — Page not found</h2>
      <p>Looks like you hit the void. Go back to the home page.</p>
      <Link to="/" className="btn primary">Back to home</Link>
    </section>
  );
}
