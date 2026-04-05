import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useFilterContext } from '../../providers/FilterProvider';
import { logout } from '../../api/auth';
import { LANGUAGES, LANG_TO_I18N } from '../../constants/languages';
import { ROUTES } from '../../constants/routes';
import type { LangCode } from '../../types/common';
import { Button } from '../ui/Button';
import { resolveTranslation } from '../../utils/translation';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { t, i18n } = useTranslation();
  const { user, setUser, lang, setLang } = useAuth();
  const { togglePanel, isOpen } = useFilterContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      setUser(null);
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });

  const currentLang = LANGUAGES.find((l) => l.code === lang);

  const handleLangChange = (code: LangCode) => {
    setLang(code);
    i18n.changeLanguage(LANG_TO_I18N[code]);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
      {/* Left: hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right: filter toggle + lang selector + user info + logout */}
      <div className="flex items-center gap-3">
        {/* Filter/Search panel toggle */}
        <button
          type="button"
          onClick={togglePanel}
          className={`p-1.5 rounded-md transition-colors ${
            isOpen
              ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label={t('common.filters')}
          title={t('common.filters')}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
        {/* Language selector */}
        <div className="relative">
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value as LangCode)}
            className="form-select py-1 text-sm w-auto cursor-pointer"
            aria-label={t('common.selectLanguage')}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Current user */}
        {user && (
          <span className="text-sm text-gray-600">
            {resolveTranslation(user.name, lang) || user.username}
          </span>
        )}

        {/* Logout */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          loading={logoutMutation.isPending}
        >
          {t('common.logout')}
        </Button>
      </div>
    </header>
  );
}
