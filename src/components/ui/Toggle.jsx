export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`toggle__track ${checked ? 'toggle__track--on' : ''}`}>
        <span className="toggle__thumb" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
