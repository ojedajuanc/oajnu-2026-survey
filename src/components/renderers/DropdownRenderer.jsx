import { normalizeOptions } from '../../config/constants.js';

export default function DropdownRenderer({ question, value, onChange }) {
  const options = normalizeOptions(question.config.options);
  const selected = options.find((o) => o.label === value);
  return (
    <div className="dropdown">
      <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Seleccioná una opción…</option>
        {options.map((opt) => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
      {selected?.description && <p className="dropdown__desc">{selected.description}</p>}
    </div>
  );
}
