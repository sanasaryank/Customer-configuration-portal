import React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getDictionary,
  getDictionaryItem,
  createDictionaryItem,
  updateDictionaryItem,
} from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import type { DictionaryKey, DictionaryItem } from '../../types/dictionary';
import { useAuth } from '../../providers/AuthProvider';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { useCrudMutations } from '../../hooks/useCrudMutations';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { Spinner } from '../../components/ui/Spinner';
import { resolveTranslation } from '../../utils/translation';

const translationSchema = z.object({
  ARM: z.string(),
  ENG: z.string(),
  RUS: z.string(),
});

const schema = z.object({
  parentId: z.string().optional(),
  name: translationSchema,
  description: z.string(),
  isBlocked: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface DictionaryModalProps {
  dictKey: DictionaryKey;
  editId: string | null;
  onClose: () => void;
  parentKey?: DictionaryKey;
  parentField?: string;
  parentLabel?: string;
}

export default function DictionaryModal({
  dictKey,
  editId,
  onClose,
  parentKey,
  parentField,
  parentLabel,
}: DictionaryModalProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const isEdit = editId !== null;
  const hasParent = !!parentKey && !!parentField;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.dictById(dictKey, editId ?? ''),
    queryFn: () => getDictionaryItem(dictKey, editId!),
    enabled: isEdit,
  });

  const { data: parentItems = [] } = useQuery({
    queryKey: queryKeys.dict(parentKey!),
    queryFn: () => getDictionary(parentKey!),
    enabled: hasParent,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentId: '',
      name: { ARM: '', ENG: '', RUS: '' },
      description: '',
      isBlocked: false,
    },
  });

  const { reset, register, handleSubmit, control, formState: { errors } } = methods;

  React.useEffect(() => {
    if (existing) {
      reset({
        parentId: hasParent
          ? String((existing as unknown as Record<string, unknown>)[parentField!] ?? '')
          : '',
        name: existing.name,
        description: existing.description ?? '',
        isBlocked: existing.isBlocked ?? false,
      });
    }
  }, [existing, reset, hasParent, parentField]);

  const invalidateKeys = [
    queryKeys.dict(dictKey),
    ...(editId ? [queryKeys.dictById(dictKey, editId)] : []),
  ];

  const buildPayload = (values: FormValues) => {
    const base = {
      name: values.name,
      description: values.description,
      isBlocked: values.isBlocked,
    };
    if (hasParent && values.parentId) {
      return { ...base, [parentField!]: values.parentId };
    }
    return base;
  };

  const { submit, isPending, mutationError } = useCrudMutations<FormValues>(
    {
      createFn: (values) => createDictionaryItem(dictKey, buildPayload(values)),
      updateFn: (values) => {
        const payload = {
          ...buildPayload(values),
          id: existing!.id,
          hash: (existing as DictionaryItem).hash,
        };
        return updateDictionaryItem(dictKey, existing!.id, payload);
      },
      invalidateKeys,
      onClose,
    },
    isEdit,
  );

  const onSubmit = (values: FormValues) => {
    if (hasParent && !values.parentId) return;
    submit(values);
  };
  const { errorMessage, onValidationError } = useFormError(mutationError);

  const safeParentItems = Array.isArray(parentItems) ? parentItems : [];
  const parentOptions = safeParentItems.map((item) => ({
    value: item.id,
    label: resolveTranslation(item.name, lang),
  }));

  const title = isEdit ? t('dictionary.editTitle') : t('dictionary.createTitle');

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
          <Button type="submit" form="dict-modal-form" loading={isPending}>
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
            onSubmit={handleSubmit(onSubmit, onValidationError)}
            className="space-y-4"
            noValidate
          >
            {hasParent && (
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <Select
                    {...field}
                    label={parentLabel ? t(parentLabel) : t('common.name')}
                    options={parentOptions}
                    placeholder="— Select —"
                    value={field.value ?? ''}
                    required
                  />
                )}
              />
            )}

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

            <ErrorBanner message={errorMessage} />
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
