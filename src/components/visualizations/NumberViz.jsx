function fmt(n) {
  if (n == null) return '—';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function NumberViz({ result }) {
  const { avg, min, max, total = 0 } = result || {};
  return (
    <div className="number-stats">
      <span>
        Promedio: <strong>{fmt(avg)}</strong>
      </span>
      <span>
        Mínimo: <strong>{fmt(min)}</strong>
      </span>
      <span>
        Máximo: <strong>{fmt(max)}</strong>
      </span>
      <span>
        Respuestas: <strong>{total}</strong>
      </span>
    </div>
  );
}
