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
          className="text-xs font-semibold select-none pl-0.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon size={16} />
          </span>
        )}

        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className="lb-input text-sm"
          style={{
            paddingLeft: Icon ? '44px' : '16px',
            paddingRight: isPassword ? '44px' : '16px',
            ...(error ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' } : {}),
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <span className="text-[11px] font-semibold text-red-500 pl-0.5 animate-fadeIn">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] font-medium pl-0.5" style={{ color: 'var(--text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
