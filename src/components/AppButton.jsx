import { Link } from 'react-router-dom';

export function AppButton({ to, href, children, className = '', ...props }) {
  const classes = ['app-button', className].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
