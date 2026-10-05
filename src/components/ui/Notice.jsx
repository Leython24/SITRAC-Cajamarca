import Icon from './Icon';
export default function Notice({ children, className = '' }) {
  return <div role="status" className={`notice ${className}`}><Icon name="info" /><div>{children}</div></div>;
}
