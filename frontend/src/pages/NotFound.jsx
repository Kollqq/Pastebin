import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div>
      <h2>404 — Not found</h2>
      <p>Страница не существует.</p>
      <Link to="/">На главную</Link>
    </div>
  );
}
