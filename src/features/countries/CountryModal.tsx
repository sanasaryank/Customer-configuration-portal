import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCountry, createCountry, updateCountry } from '../../api/countries';
import { queryKeys } from '../../queryKeys';
import type { Country } from '../../types/country';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { Spinner } from '../../components/ui/Spinner';

const schema = z.object({
  name: z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() }),
  description: z.string(),
  isBlocked: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface CountryModalProps {
  editId: string | null;
  onClose: () => void;
}

export default function CountryModal({ editId, onClose }: CountryModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.countries.byId(editId ?? ''),
    queryFn: () => getCountry(editId!),
    enabled: isEdit,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: { ARM: '', ENG: '', RUS: '' }, description: '', isBlocked: false },
  });
  const { reset, register, handleSubmit, formState: { errors } } = methods;

  React.useEffect(() => {
    if (existing) reset({ name: existing.name, description: existing.description ?? '', isBlocked: existing.isBlocked });
  }, [existing, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.countries.byId(editId) });
  };

  const createMutation = useMutation({
    mutationFn: (v: FormValues) => createCountry(v),
    onSuccess: () => { invalidate(); onClose(); },
  });
  const updateMutation = useMutation({
    mutationFn: (v: FormValues) =>
      updateCountry(existing!.id, { ...v, id: existing!.id, hash: (existing as Country).hash }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const onSubmit = (v: FormValues) => isEdit ? updateMutation.mutate(v) : createMutation.mutate(v);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <Modal
      isOpen onClose={onClose}
      title={isEdit ? t('countries.editTitle') : t('countries.createTitle')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>{t('common.cancel')}</Button>
          <Button type="submit" form="country-form" loading={isPending}>{t('common.save')}</Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="country-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <TranslationEditor fieldName="name" label={t('common.name')} required />
            <Textarea label={t('common.description')} error={errors.description?.message} {...register('description')} />
            <Checkbox label={t('common.blocked')} {...register('isBlocked')} />
            {mutationError && <p className="text-sm text-red-600">{t('common.errorOccurred')}</p>}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
