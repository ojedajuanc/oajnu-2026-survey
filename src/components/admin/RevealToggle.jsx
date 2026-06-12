import Toggle from '../ui/Toggle.jsx';

export default function RevealToggle({ revealed, onChange }) {
  return <Toggle checked={revealed} onChange={onChange} label="Revelar al público" />;
}
