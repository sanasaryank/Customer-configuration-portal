import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';

interface PasswordFieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
}

export function PasswordField({
  name,
  label,
  hint,
  required,
  autoComplete,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Resolve nested error
  const parts = name.split('.');
  let errorObj: unknown = errors;
  for (const part of parts) {
    if (!errorObj || typeof errorObj !== 'object') { errorObj = undefined; break; }
    errorObj = (errorObj as Record<string, unknown>)[part];
  }
  const errorMsg =
    errorObj && typeof errorObj === 'object' && 'message' in errorObj
      ? String((errorObj as { message: unknown }).message)
      : undefined;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete ?? 'new-password'}
          className={clsx(
            'form-input pr-10',
            errorMsg
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : '',
          )}
          {...register(name)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
        >
          {show ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {hint && !errorMsg && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {errorMsg && <p className="mt-1 text-xs text-red-600">{errorMsg}</p>}
    </div>
  );
}
