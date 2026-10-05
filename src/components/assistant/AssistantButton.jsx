import Icon from '../ui/Icon';
export default function AssistantButton({ onClick, open }) {
  return <button className="assistant-button" onClick={onClick} aria-expanded={open} aria-controls="assistant-panel">
    <Icon name="auto_awesome" /><span>✦ Preguntar a SITRAC</span>
  </button>;
}
