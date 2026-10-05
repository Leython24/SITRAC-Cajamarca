import Icon from './Icon';
export default function PageHeader({ eyebrow, icon = 'tune', title, description, children }) {
  return <div className="page-header">
    <div className="page-heading">
      {eyebrow && <div className="eyebrow"><Icon name={icon} />{eyebrow}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {children && <div className="page-actions">{children}</div>}
  </div>;
}
