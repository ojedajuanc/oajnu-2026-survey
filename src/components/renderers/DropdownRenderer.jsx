export default function DropdownRenderer({ question, value, onChange }) {
  const { options } = question.config;
  return (
    <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Seleccioná una opción…</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
