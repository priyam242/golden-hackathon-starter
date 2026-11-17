import React from 'react';
import clsx from 'clsx';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface border border-line rounded-lg p-6 shadow-subtle hover:border-line-strong transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

