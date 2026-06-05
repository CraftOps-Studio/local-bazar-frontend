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
  const base = 'inline-flex items-center justify-center font-bold rounded-xl outline-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:   'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_4px_14px_rgba(249,115,22,0.30)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.40)]',
    secondary: 'bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]',
    outline:   'bg-transparent border border-[var(--border)] hover:border-[#F97316] hover:text-[#F97316] text-[var(--text)]',
    danger:    'bg-red-500 hover:bg-red-600 text-white shadow-md',
    ghost:     'bg-transparent hover:bg-[var(--surface)] text-[var(--text-secondary)] border border-transparent',
    white:     'bg-white hover:bg-gray-50 border border-[var(--border)] text-[var(--text)] shadow-sm',
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
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
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
