import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/auth';
import { queryKeys } from '../queryKeys';
import type { CurrentUser } from '../types/auth';
import type { LangCode } from '../types/common';
import { DEFAULT_LANG, LANG_TO_I18N } from '../constants/languages';
import { FullPageSpinner } from '../components/ui/Spinner';
import i18n from '../i18n/index';

interface AuthContextValue {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const LANG_STORAGE_KEY = 'app_lang';

function loadStoredLang(): LangCode {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'ARM' || stored === 'ENG' || stored === 'RUS') return stored;
  } catch {
    // ignore
  }
  return DEFAULT_LANG;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [lang, setLangState] = useState<LangCode>(loadStoredLang);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
    i18n.changeLanguage(LANG_TO_I18N[newLang]);
  }, []);

  // On mount, sync i18n to stored lang
  useEffect(() => {
    i18n.changeLanguage(LANG_TO_I18N[lang]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Try to load current user on app startup (validates the cookie session)
  const {
    data,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    retry: false,
    // Don't refetch just because window re-focuses
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    } else if (isError) {
      setUser(null);
    }
  }, [isSuccess, isError, data]);

  if (isLoading) return <FullPageSpinner />;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: user !== null,
        isLoading,
        lang,
        setLang,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
