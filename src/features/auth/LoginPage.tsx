import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { login, getMe } from '../../api/auth';
import { useAuth } from '../../providers/AuthProvider';
import { ROUTES } from '../../constants/routes';
import { LANGUAGES, LANG_TO_I18N } from '../../constants/languages';
import type { LangCode } from '../../types/common';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, setUser, lang, setLang } = useAuth();

  // If already authenticated, redirect to main
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CUSTOMERS, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const [loginError, setLoginError] = React.useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // POST /login with Basic Authorization — response body is empty
      await login(values.username, values.password);
      // After successful login, fetch current user
      const me = await getMe();
      return me;
    },
    onSuccess: (me) => {
      setUser(me);
      navigate(ROUTES.CUSTOMERS, { replace: true });
    },
    onError: () => {
      setLoginError(t('auth.loginError'));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setLoginError(null);
    loginMutation.mutate(values);
  };

  const handleLangChange = (code: LangCode) => {
    setLang(code);
    i18n.changeLanguage(LANG_TO_I18N[code]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Language selector — visible on login screen per spec §2.7 */}
        <div className="flex justify-end mb-4">
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value as LangCode)}
            className="form-select w-auto py-1 text-sm"
            aria-label={t('common.selectLanguage')}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md px-8 py-10">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t('auth.login')}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              id="username"
              label={t('auth.username')}
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              id="password"
              type="password"
              label={t('auth.password')}
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {loginError && (
              <p className="text-sm text-red-600 text-center">{loginError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? t('auth.loggingIn')
                : t('auth.loginButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
