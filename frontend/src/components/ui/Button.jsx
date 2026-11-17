import React from 'react';
import clsx from 'clsx';

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-bold px-5 py-2.5 rounded transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const variants = {
    primary:
      'bg-inverse-bg text-inverse-fg hover:opacity-90 active:scale-[0.98] border border-line-strong',
    secondary:
      'bg-surface text-fg border border-line hover:border-line-strong active:scale-[0.98]',
    ghost:
      'bg-transparent text-fg hover:bg-bg-subtle',
  };

  return (
    <button
      disabled={disabled || loading}
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <span className="inline-block animate-spin mr-2">⟳</span>
      ) : null}
      <span className={variant === 'primary' ? 'text-gradient-inverse' : 'text-gradient'}>
        {children}
      </span>
    </button>
  );
}

