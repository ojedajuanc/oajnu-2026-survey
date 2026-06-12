export default function TextViz({ result }) {
  const { responses = [] } = result || {};
  if (responses.length === 0) return <p className="muted">Sin respuestas todavía.</p>;
  return (
    <div className="text-list">
      {responses.map((r, i) => (
        <div className="text-list__item" key={i}>
          {r}
        </div>
      ))}
    </div>
  );
}
