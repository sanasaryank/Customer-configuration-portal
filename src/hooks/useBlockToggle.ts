import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseBlockToggleOptions<TFull> {
  /** Fetch the full entity by ID (to get hash and existing fields). */
  getItem: (id: string) => Promise<TFull>;
  /** Update the entity; must accept id + the full entity with isBlocked toggled. */
  updateItem: (id: string, payload: TFull & { isBlocked: boolean }) => Promise<unknown>;
  /** Query key to invalidate on success. */
  listQueryKey: readonly unknown[];
}

export function useBlockToggle<TFull extends { isBlocked: boolean }>(
  options: UseBlockToggleOptions<TFull>,
) {
  const { getItem, updateItem, listQueryKey } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }) => {
      const full = await getItem(id);
      return updateItem(id, { ...full, isBlocked });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listQueryKey }),
  });
}
