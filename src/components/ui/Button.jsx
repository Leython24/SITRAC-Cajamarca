import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function Button({ children, icon, endIcon, variant = 'secondary', className = '', to, ...props }) {
  const Component = to ? Link : 'button';
  return <Component {...(to ? { to } : { type: 'button' })} className={`button button-${variant} ${className}`} {...props}>
    {icon && <Icon name={icon} />}{children}{endIcon && <Icon name={endIcon} />}
  </Component>;
}
