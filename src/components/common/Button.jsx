import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl outline-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
    secondary: 'bg-brand-surface-2 hover:bg-brand-surface border border-brand-border hover:border-brand-border/80 text-brand-text',
    outline: 'bg-transparent border border-brand-border hover:border-primary hover:text-primary text-brand-text',
    danger: 'bg-error hover:bg-rose-600 text-white shadow-md shadow-error/15 hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-brand-surface-2 text-brand-muted hover:text-brand-text border border-transparent',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 17} />}
      
      <span>{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 17} />}
    </button>
  );
};

export default Button;
