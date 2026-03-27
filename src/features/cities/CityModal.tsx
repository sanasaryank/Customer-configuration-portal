import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCity, createCity, updateCity } from '../../api/cities';
import { getCountries } from '../../api/countries';
import { queryKeys } from '../../queryKeys';
import type { City } from '../../types/city';
import { useAuth } from '../../providers/AuthProvider';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { DictionarySelect } from '../../components/form/DictionarySelect';
import { Spinner } from '../../components/ui/Spinner';

const schema = z.object({
  countryId: z.string().min(1),
  name: z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() }),
  description: z.string(),
  isBlocked: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface CityModalProps {
  editId: string | null;
  onClose: () => void;
}

export default function CityModal({ editId, onClose }: CityModalProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.cities.byId(editId ?? ''),
    queryFn: () => getCity(editId!),
    enabled: isEdit,
  });

  const { data: countries = [] } = useQuery({
    queryKey: queryKeys.countries.all,
    queryFn: getCountries,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { countryId: '', name: { ARM: '', ENG: '', RUS: '' }, description: '', isBlocked: false },
  });
  const { reset, register, handleSubmit, formState: { errors } } = methods;

  React.useEffect(() => {
    if (existing) reset({ countryId: existing.countryId, name: existing.name, description: existing.description ?? '', isBlocked: existing.isBlocked });
  }, [existing, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cities.all });
    if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.cities.byId(editId) });
  };

  const createMutation = useMutation({
    mutationFn: (v: FormValues) => createCity(v),
    onSuccess: () => { invalidate(); onClose(); },
  });
  const updateMutation = useMutation({
    mutationFn: (v: FormValues) => updateCity(existing!.id, { ...v, id: existing!.id, hash: (existing as City).hash }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const onSubmit = (v: FormValues) => isEdit ? updateMutation.mutate(v) : createMutation.mutate(v);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <Modal isOpen onClose={onClose}
      title={isEdit ? t('cities.editTitle') : t('cities.createTitle')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>{t('common.cancel')}</Button>
          <Button type="submit" form="city-form" loading={isPending}>{t('common.save')}</Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="city-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <DictionarySelect
              name="countryId"
              label={t('cities.country')}
              items={countries}
              lang={lang}
              required
            />
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
