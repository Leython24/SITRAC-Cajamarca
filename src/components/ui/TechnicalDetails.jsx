import Icon from './Icon';
export default function TechnicalDetails({ title = 'Ver información técnica', children, subtitle }) {
  return <details className="technical-details">
    <summary><Icon name="tune" /><span>{title}{subtitle && <small>{subtitle}</small>}</span><Icon name="expand_more" /></summary>
    <div className="technical-content">{children}</div>
  </details>;
}
