export default function Button({ variant = 'default', lg = false, className = '', ...props }) {
  const classes = [
    'btn',
    variant === 'primary' && 'btn--primary',
    variant === 'outline' && 'btn--outline',
    variant === 'ghost' && 'btn--ghost',
    lg && 'btn--lg',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button className={classes} {...props} />;
}
