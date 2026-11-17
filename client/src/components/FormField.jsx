import React from 'react';

export const FormField = ({
  id,
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
      </label>

      {children}

      {helpText && !error && (
        <p id={`${id}-help`} className="text-xs text-slate-500">
          {helpText}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
