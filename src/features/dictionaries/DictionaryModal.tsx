import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getDictionaryItem,
  createDictionaryItem,
  updateDictionaryItem,
} from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import type { DictionaryKey, DictionaryItem } from '../../types/dictionary';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { Spinner } from '../../components/ui/Spinner';

const translationSchema = z.object({
  ARM: z.string(),
  ENG: z.string(),
  RUS: z.string(),
});

const schema = z.object({
  name: translationSchema,
  description: z.string(),
  isBlocked: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface DictionaryModalProps {
  dictKey: DictionaryKey;
  editId: string | null;
  onClose: () => void;
}

export default function DictionaryModal({
  dictKey,
  editId,
  onClose,
}: DictionaryModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = editId !== null;

  // Load existing item for edit mode
  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.dictById(dictKey, editId ?? ''),
    queryFn: () => getDictionaryItem(dictKey, editId!),
    enabled: isEdit,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: { ARM: '', ENG: '', RUS: '' },
      description: '',
      isBlocked: false,
    },
  });

  const { reset, register, handleSubmit, formState: { errors } } = methods;

  // Populate form when existing data loads
  React.useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? '',
        isBlocked: existing.isBlocked ?? false,
      });
    }
  }, [existing, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dict(dictKey) });
    if (editId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dictById(dictKey, editId),
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      createDictionaryItem(dictKey, values),
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        id: existing!.id,
        hash: (existing as DictionaryItem).hash,
      };
      return updateDictionaryItem(dictKey, existing!.id, payload);
    },
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const title = isEdit
    ? t('dictionary.editTitle')
    : t('dictionary.createTitle');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="dict-modal-form"
            loading={isPending}
          >
            {t('common.save')}
          </Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <FormProvider {...methods}>
          <form
            id="dict-modal-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <TranslationEditor fieldName="name" label={t('common.name')} required />

            <Textarea
              label={t('common.description')}
              error={errors.description?.message}
              {...register('description')}
            />

            <Checkbox
              label={t('common.blocked')}
              {...register('isBlocked')}
            />

            {mutationError && (
              <p className="text-sm text-red-600">{t('common.errorOccurred')}</p>
            )}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
