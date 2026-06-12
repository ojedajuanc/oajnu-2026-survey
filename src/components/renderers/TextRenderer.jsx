export default function TextRenderer({ question, value, onChange }) {
  const { charLimit, placeholder } = question.config;
  const text = value || '';
  const warn = charLimit - text.length <= 20;
  return (
    <div>
      <textarea
        className="textarea"
        value={text}
        placeholder={placeholder || ''}
        maxLength={charLimit}
        onChange={(e) => onChange(e.target.value.slice(0, charLimit))}
      />
      <div className={`text-counter ${warn ? 'text-counter--warn' : ''}`}>
        {text.length} / {charLimit}
      </div>
    </div>
  );
}
