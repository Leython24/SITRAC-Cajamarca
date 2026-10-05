import Icon from './Icon';
export default function MetricCard({ label, value = null, unit, note, icon }) {
  return <div className="metric-card">
    <div className="metric-content"><span className="metric-label">{label}</span>
      <div className="metric-value">{value ?? '—'}{unit && <small>{unit}</small>}</div>
      {note && <p>{note}</p>}
    </div>
    {icon && <span className="metric-icon"><Icon name={icon} /></span>}
  </div>;
}
