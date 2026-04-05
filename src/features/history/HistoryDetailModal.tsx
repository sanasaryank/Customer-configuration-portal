import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getHistoryItem } from '../../api/history';
import { queryKeys } from '../../queryKeys';
import { DiffNodeRenderer } from '../../utils/historyDiff';
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

  const diff = data ?? {};
  const isEmpty = Object.keys(diff).length === 0;

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
      ) : isEmpty ? (
        <p className="text-sm text-gray-400 text-center py-4">
          {t('history.noChanges')}
        </p>
      ) : (
        <DiffNodeRenderer node={diff} t={t} />
      )}
    </Modal>
  );
}
