import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './Input';

interface CopyableInputProps {
  label?: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputRef?: React.Ref<any>;
}

export function CopyableInput({ label, value, inputRef }: CopyableInputProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        label={label}
        value={value}
        readOnly
        className="bg-gray-50 cursor-default pr-9"
      />
      <button
        type="button"
        title={t('common.copy')}
        onClick={() => navigator.clipboard.writeText(value)}
        className="absolute right-2 bottom-1.5 p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
}

