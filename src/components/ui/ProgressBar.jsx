export default function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="progressbar" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="progressbar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
