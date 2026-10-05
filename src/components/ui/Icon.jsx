export default function Icon({ name, className = '' }) {
  return <span className={`icon ${className}`} aria-hidden="true">{name}</span>;
}
