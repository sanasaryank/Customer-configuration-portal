import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? t('common.deleteTitle')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            {confirmLabel ?? t('common.delete')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        {message ?? t('common.confirmDelete')}
      </p>
    </Modal>
  );
}
