import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-0.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={clsx('form-checkbox', className)}
            {...rest}
          />
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
        </label>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
