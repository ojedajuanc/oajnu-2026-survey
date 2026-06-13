import { normalizeOptions } from '../../config/constants.js';

export default function CheckRenderer({ question, value, onChange }) {
  const { min, max } = question.config;
  const options = normalizeOptions(question.config.options);
  const selected = Array.isArray(value) ? value : [];

  function toggle(label) {
    if (selected.includes(label)) {
      onChange(selected.filter((o) => o !== label));
    } else {
      onChange([...selected, label]);
    }
  }

  const atMax = max != null && selected.length >= max;

  let hint = null;
  if (min != null && max != null) {
    hint = min === max ? `Elegí ${min} opción(es).` : `Elegí entre ${min} y ${max} opciones.`;
  } else if (min != null) {
    hint = `Elegí al menos ${min} opción(es).`;
  } else if (max != null) {
    hint = `Elegí hasta ${max} opción(es).`;
  }

  return (
    <div className="check">
      {options.map((opt) => {
        const isChecked = selected.includes(opt.label);
        const disabled = !isChecked && atMax;
        return (
          <label
            key={opt.label}
            className={`check__option ${isChecked ? 'check__option--selected' : ''} ${
              disabled ? 'check__option--disabled' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={disabled}
              onChange={() => toggle(opt.label)}
            />
            <span className="check__option-text">
              <span>{opt.label}</span>
              {opt.description && <span className="check__option-desc">{opt.description}</span>}
            </span>
          </label>
        );
      })}
      {hint && <p className="check__hint">{hint}</p>}
    </div>
  );
}
