import { useState, useCallback } from 'react';

interface UseConfirmDialogResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  confirm: () => void;
  pendingAction: (() => Promise<void>) | null;
  requestConfirm: (action: () => Promise<void>) => void;
}

export function useConfirmDialog(): UseConfirmDialogResult {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  const requestConfirm = useCallback((action: () => Promise<void>) => {
    setPendingAction(() => action);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  const confirm = useCallback(async () => {
    if (pendingAction) {
      await pendingAction();
    }
    setIsOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  return { isOpen, open, close, confirm, pendingAction, requestConfirm };
}
