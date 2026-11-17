import React from 'react';
import clsx from 'clsx';

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold tracking-wide">
          <span className="text-gradient">{label}</span>
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full px-3.5 py-2.5 rounded bg-surface border border-line text-fg placeholder:text-fg-muted focus:border-line-strong focus:outline-none transition-colors',
          error && 'border-dashed border-line-strong',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs font-bold text-fg-muted">
          [Error: {error}]
        </span>
      )}
    </div>
  );
}

