import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getWorkingDays, postWorkingDay } from '../../api/workingDays';
import { getDictionary } from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import { resolveTranslation } from '../../utils/translation';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import clsx from 'clsx';
import { Spinner } from '../../components/ui/Spinner';
import type { WorkingDaysResponse } from '../../types/workingDays';

type WDCache = WorkingDaysResponse; // string[]

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Returns 0=Monday … 6=Sunday
function getFirstDayOfMonth(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


export default function WorkingDaysPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [countryId, setCountryId] = useState<string>('');

  // Load countries for the filter
  const { data: countries = [] } = useQuery({
    queryKey: queryKeys.dict('countries'),
    queryFn: () => getDictionary('countries'),
  });

  // Auto-select the only country when there is exactly one
  useEffect(() => {
    if (countries.length === 1 && !countryId) {
      setCountryId(countries[0].id);
    }
  }, [countries, countryId]);

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: resolveTranslation(c.name, lang),
  }));

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.workingDays(countryId),
    queryFn: () => getWorkingDays(countryId),
    enabled: !!countryId,
  });

  const nonWorkingSet = React.useMemo(
    () => new Set(Array.isArray(data) ? data : []),
    [data],
  );

  const toggleMutation = useMutation({
    mutationFn: ({ dateStr, action }: { dateStr: string; action: 'add' | 'remove' }) =>
      postWorkingDay(countryId, { date: dateStr, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workingDays(countryId) });
    },
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);

  // Build grid cells: blank cells for alignment + day numbers
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-semibold text-gray-900">{t('workingDays.title')}</h1>

      {/* Country filter */}
      <Select
        label={t('workingDays.country')}
        options={countryOptions}
        value={countryId}
        onChange={(e) => setCountryId(e.target.value)}
        placeholder={t('common.select')}
      />

      {/* Calendar — only shown once a country is selected */}
      {countryId && (
        <>
          {/* Calendar navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
            <Button variant="ghost" size="sm" onClick={prevMonth} aria-label={t('common.prevMonth')}>
              ‹
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <Button variant="secondary" size="sm" onClick={goToday}>
                {t('common.today')}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={nextMonth} aria-label={t('common.nextMonth')}>
              ›
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={`blank-${i}`} />;
                  }
                  const dateStr = toYMD(new Date(viewYear, viewMonth, day));
                  const isWorking = !nonWorkingSet.has(dateStr);
                  const isToday =
                    today.getFullYear() === viewYear &&
                    today.getMonth() === viewMonth &&
                    today.getDate() === day;

                  const isPending =
                    toggleMutation.isPending && toggleMutation.variables?.dateStr === dateStr;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const currentData = queryClient.getQueryData<WDCache>(queryKeys.workingDays(countryId));
                        const currentSet = new Set(Array.isArray(currentData) ? currentData : []);
                        const currentlyNonWorking = currentSet.has(dateStr);
                        toggleMutation.mutate({
                          dateStr,
                          action: currentlyNonWorking ? 'remove' : 'add',
                        });
                      }}
                      disabled={isPending}
                      title={isWorking ? t('workingDays.workingDay') : t('workingDays.notWorkingDay')}
                      className={clsx(
                        'aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                        isToday && 'ring-2 ring-offset-1 ring-gray-400',
                        isWorking
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
                        isPending && 'opacity-50 cursor-wait',
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-md bg-green-100 border border-green-300 inline-block" />
                  {t('workingDays.workingDay')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-md bg-red-50 border border-red-200 inline-block" />
                  {t('workingDays.notWorkingDay')}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
