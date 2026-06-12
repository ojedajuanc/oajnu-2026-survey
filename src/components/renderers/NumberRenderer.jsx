export default function NumberRenderer({ question, value, onChange }) {
  const { min, max, placeholder } = question.config;
  return (
    <input
      type="number"
      className="input"
      value={value ?? ''}
      min={min ?? undefined}
      max={max ?? undefined}
      placeholder={placeholder || ''}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? undefined : Number(raw));
      }}
    />
  );
}
