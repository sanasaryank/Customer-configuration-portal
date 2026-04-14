import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTagItem, createTag, updateTag } from '../../api/tags';
import { queryKeys } from '../../queryKeys';
import type { TagDictionaryKey, TagDictionaryItem, TagListItem } from '../../types/tag';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { useCrudMutations } from '../../hooks/useCrudMutations';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { TagItemsEditor } from '../../components/form/TagItemsEditor';
import { Spinner } from '../../components/ui/Spinner';

const translationSchema = z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() });

const itemSchema = z.object({
  id: z.string().min(1),
  name: translationSchema,
  description: z.string(),
  isBlocked: z.boolean(),
});

const schema = z.object({
  name: translationSchema,
  description: z.string(),
  isBlocked: z.boolean(),
  items: z.array(itemSchema),
}).superRefine((data, ctx) => {
  // All item IDs must be unique within the form
  const seen = new Set<string>();
  for (let i = 0; i < data.items.length; i++) {
    const id = data.items[i].id;
    if (!id) continue;
    if (seen.has(id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ID must be unique', path: ['items', i, 'id'] });
    }
    seen.add(id);
  }
});

type FormValues = z.infer<typeof schema>;

interface TagDictionaryModalProps {
  tagKey: TagDictionaryKey;
  editId: string | null;
  onClose: () => void;
  /** All existing tags in this dictionary, used to validate cross-tag ID uniqueness. */
  existingTags: TagListItem[];
}

export default function TagDictionaryModal({
  tagKey,
  editId,
  onClose,
  existingTags,
}: TagDictionaryModalProps) {
  const { t } = useTranslation();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.tagById(tagKey, editId ?? ''),
    queryFn: () => getTagItem(tagKey, editId!),
    enabled: isEdit,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: { ARM: '', ENG: '', RUS: '' },
      description: '',
      isBlocked: false,
      items: [],
    },
  });

  const { reset, register, handleSubmit, setError, formState: { errors } } = methods;

  React.useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? '',
        isBlocked: existing.isBlocked ?? false,
        items: (existing.items ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? '',
          isBlocked: item.isBlocked ?? false,
        })),
      });
    }
  }, [existing, reset]);

  // Collect all existing IDs (from other tags) for cross-tag uniqueness
  const existingIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const tag of existingTags) {
      if (isEdit && tag.id === editId) continue;
      for (const item of tag.items) {
        ids.add(item.id);
      }
    }
    return ids;
  }, [existingTags, isEdit, editId]);

  const invalidateKeys = [queryKeys.tag(tagKey)];

  const { submit, isPending, mutationError } = useCrudMutations<FormValues>(
    {
      createFn: (values) => createTag(tagKey, values),
      updateFn: (values) =>
        updateTag(tagKey, existing!.id, {
          ...values,
          hash: (existing as TagDictionaryItem).hash,
        }),
      invalidateKeys,
      onClose,
    },
    isEdit,
  );

  const onSubmit = (values: FormValues) => {
    // Cross-tag item ID uniqueness validation
    for (let i = 0; i < values.items.length; i++) {
      if (existingIds.has(values.items[i].id)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError(`items.${i}.id` as any, { message: t('tags.idNotUnique') });
        return;
      }
    }
    submit(values);
  };

  const { errorMessage, onValidationError } = useFormError(mutationError);

  const title = isEdit ? t('tags.editTitle') : t('tags.createTitle');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="tag-modal-form" loading={isPending}>
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
            id="tag-modal-form"
            onSubmit={handleSubmit(onSubmit, onValidationError)}
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

            <TagItemsEditor fieldName="items" />

            <ErrorBanner message={errorMessage} />
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
