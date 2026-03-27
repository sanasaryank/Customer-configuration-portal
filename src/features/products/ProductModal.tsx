import React from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getProduct, createProduct, updateProduct } from '../../api/products';
import { getDictionary } from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import type { Product } from '../../types/product';
import { useAuth } from '../../providers/AuthProvider';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { DictionarySelect } from '../../components/form/DictionarySelect';
import { Spinner } from '../../components/ui/Spinner';

const licenseFieldSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['string', 'number', 'date', 'time', 'datetime', 'boolean']),
  required: z.boolean(),
});

const schema = z.object({
  groupId: z.string().min(1),
  name: z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() }),
  isBlocked: z.boolean(),
  hasUsers: z.boolean(),
  licenseTemplate: z.array(licenseFieldSchema),
  description: z.string(),
});

type FormValues = z.infer<typeof schema>;

const KIND_OPTIONS = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'boolean', label: 'Boolean' },
];

interface ProductModalProps {
  editId: string | null;
  onClose: () => void;
}

export default function ProductModal({ editId, onClose }: ProductModalProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.products.byId(editId ?? ''),
    queryFn: () => getProduct(editId!),
    enabled: isEdit,
  });

  const { data: productGroups = [] } = useQuery({
    queryKey: queryKeys.dict('productGroups'),
    queryFn: () => getDictionary('productGroups'),
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupId: '',
      name: { ARM: '', ENG: '', RUS: '' },
      isBlocked: false,
      hasUsers: false,
      licenseTemplate: [],
      description: '',
    },
  });
  const { reset, register, handleSubmit, formState: { errors }, control } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'licenseTemplate' });

  React.useEffect(() => {
    if (existing) {
      reset({
        groupId: existing.groupId,
        name: existing.name,
        isBlocked: existing.isBlocked,
        hasUsers: existing.hasUsers,
        licenseTemplate: existing.licenseTemplate ?? [],
        description: existing.description ?? '',
      });
    }
  }, [existing, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(editId) });
  };

  const createMutation = useMutation({
    mutationFn: (v: FormValues) => createProduct(v),
    onSuccess: () => { invalidate(); onClose(); },
  });
  const updateMutation = useMutation({
    mutationFn: (v: FormValues) =>
      updateProduct(existing!.id, { ...v, id: existing!.id, hash: (existing as Product).hash }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const onSubmit = (v: FormValues) => isEdit ? updateMutation.mutate(v) : createMutation.mutate(v);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <Modal isOpen onClose={onClose}
      title={isEdit ? t('products.editTitle') : t('products.createTitle')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>{t('common.cancel')}</Button>
          <Button type="submit" form="product-form" loading={isPending}>{t('common.save')}</Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <TranslationEditor fieldName="name" label={t('common.name')} required />

            <DictionarySelect name="groupId" label={t('products.group')} items={productGroups} lang={lang} required />

            <div className="flex gap-6">
              <Checkbox label={t('products.hasUsers')} {...register('hasUsers')} />
              <Checkbox label={t('common.blocked')} {...register('isBlocked')} />
            </div>

            <Textarea label={t('common.description')} error={errors.description?.message} {...register('description')} />

            {/* License template editor */}
            <fieldset className="border border-gray-200 rounded-md p-3">
              <legend className="text-sm font-medium text-gray-700 px-1">
                {t('products.licenseTemplate')}
              </legend>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                    <Input
                      placeholder={t('products.fieldName')}
                      error={errors.licenseTemplate?.[index]?.name?.message}
                      {...register(`licenseTemplate.${index}.name`)}
                    />
                    <Select
                      options={KIND_OPTIONS}
                      error={errors.licenseTemplate?.[index]?.kind?.message}
                      {...register(`licenseTemplate.${index}.kind`)}
                    />
                    <div className="flex items-center gap-1 pt-2 shrink-0">
                      <Checkbox
                        label={t('products.fieldRequired')}
                        {...register(`licenseTemplate.${index}.required`)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="text-red-600 shrink-0 mt-1"
                      onClick={() => remove(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append({ name: '', kind: 'string', required: false })}
                >
                  + {t('products.addField')}
                </Button>
              </div>
            </fieldset>

            {mutationError && <p className="text-sm text-red-600">{t('common.errorOccurred')}</p>}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
