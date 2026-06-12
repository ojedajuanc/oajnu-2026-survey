export default function DropdownViz({ question, result }) {
  const { counts = {}, total = 0 } = result || {};
  const rows = (question.config.options || [])
    .map((opt) => ({ label: opt, count: counts[opt] || 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {rows.map((r, i) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
        return (
          <div className="bar-row" key={i}>
            <div className="bar-row__label">
              <span>{r.label}</span>
              <span>
                {pct}% ({r.count})
              </span>
            </div>
            <div className="bar-row__track">
              <div className="bar-row__fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
