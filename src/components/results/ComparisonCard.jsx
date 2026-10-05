import StatusBadge from '../ui/StatusBadge';
export default function ComparisonCard({ metric }) {
  return <div className="comparison-metric"><span className="metric-label">{metric.label}</span><div className="comparison-value"><strong>{metric.change ?? '—'}</strong><StatusBadge>Pendiente</StatusBadge></div><div className="before-after-values"><div><small>Actual</small><code>{metric.before ?? '—'} {metric.unit}</code></div><div><small>SITRAC</small><code>{metric.after ?? '—'} {metric.unit}</code></div></div></div>;
}
