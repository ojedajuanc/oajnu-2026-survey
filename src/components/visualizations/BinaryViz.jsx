function pct(n, total) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export default function BinaryViz({ question, result }) {
  const { labelA, labelB } = question.config;
  const { totalA = 0, totalB = 0, total = 0 } = result || {};
  const rows = [
    { label: labelA, count: totalA },
    { label: labelB, count: totalB },
  ];
  return (
    <div>
      {rows.map((r, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-row__label">
            <span>{r.label}</span>
            <span>
              {pct(r.count, total)}% ({r.count})
            </span>
          </div>
          <div className="bar-row__track">
            <div className="bar-row__fill" style={{ width: `${pct(r.count, total)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
