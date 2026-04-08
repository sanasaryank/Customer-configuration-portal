import React from 'react';
import clsx from 'clsx';

// ─── Icon components ──────────────────────────────────────────────────────────

export function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11.5 2.5a1.5 1.5 0 0 1 2 2L5 13H3v-2L11.5 2.5z" />
    </svg>
  );
}

export function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="1" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function IconUnlock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="1" />
      <path d="M11 7V4a3 3 0 0 0-6 0" />
    </svg>
  );
}

export function IconHistory() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  );
}

export function IconMoveLicense() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 5h14M11 2l3 3-3 3" />
      <path d="M15 11H1M5 8l-3 3 3 3" />
    </svg>
  );
}

export function IconRenewLicense() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Calendar body */}
      <rect x="1.5" y="3" width="13" height="11.5" rx="1.2" />
      {/* Top bar */}
      <path d="M1.5 6.5h13" />
      {/* Hanging ticks */}
      <path d="M5 1.5v3M11 1.5v3" />
      {/* Plus sign in lower-right */}
      <path d="M10 10.5h3M11.5 9v3" />
    </svg>
  );
}

export function IconView() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function IconDelete() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4h12M5 4V2.5h6V4M6 7v5M10 7v5M3 4l1 9.5h8L13 4" />
    </svg>
  );
}

export function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="3" r="1.5" />
      <circle cx="12" cy="13" r="1.5" />
      <circle cx="4" cy="8" r="1.5" />
      <path d="M5.4 7.3L10.6 4.2M5.4 8.7L10.6 11.8" />
    </svg>
  );
}

export function IconCopy() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5.5" y="5.5" width="9" height="9" rx="1" />
      <path d="M10.5 5.5V2.5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3" />
    </svg>
  );
}

// ─── RowActions component ─────────────────────────────────────────────────────

export interface RowAction {
  key: string;
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
}

interface RowActionsProps {
  actions: RowAction[];
}

export function RowActions({ actions }: RowActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          title={action.title}
          disabled={action.disabled}
          onClick={action.onClick}
          className={clsx(
            'p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
            action.variant === 'danger'
              ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
              : action.variant === 'warning'
              ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
