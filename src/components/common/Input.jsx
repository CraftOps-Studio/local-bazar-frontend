import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isPassword = type === 'password';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-bold text-brand-muted uppercase tracking-wider select-none pl-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none transition-colors">
            <Icon size={16} />
          </span>
        )}
        
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={`
            w-full bg-brand-surface-2 border rounded-xl py-3 px-4 outline-none text-brand-text placeholder-brand-muted transition-all duration-200
            ${Icon ? 'pl-11' : 'pl-4'}
            ${isPassword ? 'pr-11' : 'pr-4'}
            ${error 
              ? 'border-error/50 focus:border-error focus:ring-1 focus:ring-error' 
              : 'border-brand-border focus:border-primary focus:ring-1 focus:ring-primary'
            }
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <span className="text-[11px] font-semibold text-error pl-1 animate-fadeIn">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-[11px] font-medium text-brand-muted pl-1">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
