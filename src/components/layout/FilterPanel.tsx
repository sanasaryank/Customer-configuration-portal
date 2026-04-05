import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFilterContext } from '../../providers/FilterProvider';
import { FILTER_CONFIGS } from '../../constants/filterConfigs';

export function FilterPanel() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { getFilters, setFilter, clearFilters, getFieldOptions, isOpen, togglePanel, closePanel } = useFilterContext();

  const fieldConfigs = FILTER_CONFIGS[pathname] ?? [];

  // If no filter config for this route, render nothing (no toggle tab either)
  if (!fieldConfigs.length) return null;

  const fieldFilters = getFilters(pathname);
  const hasActiveFilters = Object.values(fieldFilters).some((v) => v.trim());

  return (
    <div className="flex shrink-0 h-full border-l border-gray-200">
      {/* Full panel — visible when open */}
      <aside
        className="flex flex-col bg-white overflow-hidden transition-[width] duration-200 ease-in-out"
        style={{ width: isOpen ? 256 : 0 }}
      >
        <div style={{ width: 256 }} className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {t('common.filters')}
            </span>
            <button
              type="button"
              onClick={closePanel}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label={t('common.close')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Per-field filters */}
          <div className="flex flex-col py-2">
            {fieldConfigs.map((cfg) => {
              const currentValue = fieldFilters[cfg.key] ?? '';
              const fieldType = cfg.type ?? 'text';

              if (fieldType === 'switch') {
                const isActive = currentValue === 'active';
                return (
                  <div key={cfg.key} className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-medium text-gray-600">{t(cfg.labelKey)}</span>
                    <button
                      role="switch"
                      aria-checked={isActive}
                      type="button"
                      onClick={() => setFilter(pathname, cfg.key, isActive ? '' : 'active')}
                      className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none ${
                        isActive ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              }

              if (fieldType === 'select') {
                const dynamicOptions = getFieldOptions(pathname, cfg.key);
                const allOptions = [...(cfg.staticOptions ?? []), ...dynamicOptions];
                return (
                  <div key={cfg.key} className="flex flex-col gap-1 px-4 py-2">
                    <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                      {t(cfg.labelKey)}
                    </label>
                    <select
                      className="form-select text-sm w-full"
                      value={currentValue}
                      onChange={(e) => setFilter(pathname, cfg.key, e.target.value)}
                    >
                      <option value="">{t('common.all')}</option>
                      {allOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.labelKey ? t(opt.labelKey) : opt.label ?? opt.value}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // default: text
              return (
                <div key={cfg.key} className="flex flex-col gap-1 px-4 py-2">
                  <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    {t(cfg.labelKey)}
                  </label>
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder={t(cfg.labelKey)}
                    value={currentValue}
                    onChange={(e) => setFilter(pathname, cfg.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <div className="px-4 pb-3">
              <button
                type="button"
                className="text-xs text-primary-600 hover:text-primary-800"
                onClick={() => clearFilters(pathname)}
              >
                {t('common.clearSearch')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Always-visible toggle tab */}
      <button
        type="button"
        onClick={togglePanel}
        title={isOpen ? t('common.close') : t('common.filters')}
        aria-label={isOpen ? t('common.close') : t('common.filters')}
        className="relative flex flex-col items-center justify-center w-6 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 transition-colors gap-1 cursor-pointer shrink-0"
      >
        {!isOpen && hasActiveFilters && (
          <span className="absolute top-2 w-2 h-2 rounded-full bg-primary-500" />
        )}
        <svg
          className="w-3 h-3 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </button>
    </div>
  );
}
