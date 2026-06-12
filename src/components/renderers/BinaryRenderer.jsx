export default function BinaryRenderer({ question, value, onChange }) {
  const { labelA, labelB } = question.config;
  const cards = [
    { key: 'A', label: labelA },
    { key: 'B', label: labelB },
  ];
  return (
    <div className="binary">
      {cards.map((c) => {
        const selected = value === c.key;
        return (
          <button
            type="button"
            key={c.key}
            className={`binary__card ${selected ? 'binary__card--selected' : ''}`}
            onClick={() => onChange(c.key)}
          >
            {c.label}
            {selected && <span className="binary__check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
