import React from 'react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const { t } = useTranslation();

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 text-sm text-gray-600',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <span>
          {start}–{end} / {totalItems}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1">
            <span>{t('common.rowsPerPage')}:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="form-select w-auto py-1 px-2 text-sm"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          «
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          ‹
        </Button>
        <span className="px-3">
          {t('common.page')} {page} {t('common.of')} {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          ›
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
        >
          »
        </Button>
      </div>
    </div>
  );
}
