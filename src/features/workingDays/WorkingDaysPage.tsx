import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getWorkingDays, postWorkingDay } from '../../api/workingDays';
import { queryKeys } from '../../queryKeys';
import { toYMD } from '../../utils/timestamp';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import clsx from 'clsx';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function WorkingDaysPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.workingDays,
    queryFn: getWorkingDays,
  });

  const workingSet = React.useMemo(
    () => new Set(data?.dates ?? []),
    [data],
  );

  const toggleMutation = useMutation({
    mutationFn: (dateStr: string) => {
      const action = workingSet.has(dateStr) ? 'remove' : 'add';
      return postWorkingDay({ date: dateStr, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workingDays });
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
              const isWorking = workingSet.has(dateStr);
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              const isPending = toggleMutation.isPending && toggleMutation.variables === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleMutation.mutate(dateStr)}
                  disabled={isPending}
                  title={isWorking ? t('workingDays.workingDay') : t('workingDays.notWorkingDay')}
                  className={clsx(
                    'aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                    isToday && 'ring-2 ring-primary-400',
                    isWorking
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'text-gray-700 hover:bg-gray-100',
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
              <span className="w-4 h-4 rounded-full bg-primary-600 inline-block" />
              {t('workingDays.workingDay')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300 inline-block" />
              {t('workingDays.notWorkingDay')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
