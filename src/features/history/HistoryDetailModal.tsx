import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getHistoryItem } from '../../api/history';
import { queryKeys } from '../../queryKeys';
import type { HistoryDetail } from '../../types/history';
import { renderDiffValue, formatFieldPath } from '../../utils/historyDiff';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';

interface HistoryDetailModalProps {
  historyId: number;
  onClose: () => void;
}

export default function HistoryDetailModal({
  historyId,
  onClose,
}: HistoryDetailModalProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.history.item(historyId),
    queryFn: () => getHistoryItem(historyId),
  });

  const diffs: HistoryDetail = data ?? [];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('history.details')}
      size="xl"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : diffs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          {t('history.noChanges')}
        </p>
      ) : (
        <div className="space-y-3">
          {diffs.map((entry, i) => (
            <div
              key={i}
              className="rounded-md border border-gray-200 overflow-hidden"
            >
              {/* Field path header */}
              <div className="bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-gray-700 border-b border-gray-200">
                {formatFieldPath(entry.newState.field || entry.oldState.field)}
              </div>

              {/* Old / New values */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {t('history.oldValue')}
                  </p>
                  <div className="text-sm text-gray-800">
                    {renderDiffValue(entry.oldState.value)}
                  </div>
                </div>
                <div className="p-3 bg-green-50/30">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {t('history.newValue')}
                  </p>
                  <div className="text-sm text-gray-800">
                    {renderDiffValue(entry.newState.value)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
