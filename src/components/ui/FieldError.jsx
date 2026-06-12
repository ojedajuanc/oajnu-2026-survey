export default function FieldError({ message }) {
  return <div className={`field-error ${message ? 'visible' : ''}`}>{message || ''}</div>;
}
