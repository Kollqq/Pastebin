export default function Spinner({ size = 22 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} aria-label="Loading" />
  );
}
