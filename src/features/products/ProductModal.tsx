import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getProduct, createProduct, updateProduct } from '../../api/products';
import { queryKeys } from '../../queryKeys';
import type { Product } from '../../types/product';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { useCrudMutations } from '../../hooks/useCrudMutations';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs, TabList, TabTrigger, TabPanel } from '../../components/ui/Tabs';
import { ProductGeneralInfoTab } from './tabs/GeneralInfoTab';
import { ProductLicenseTemplateTab } from './tabs/LicenseTemplateTab';
import { ProductTagsTab } from './tabs/TagsTab';

const licenseFieldSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['string', 'number', 'date', 'time', 'datetime', 'boolean']),
  required: z.boolean(),
});

const schema = z.object({
  productId: z.string().min(1),
  groupId: z.string().min(1),
  name: z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() }),
  isBlocked: z.boolean(),
  hasUsers: z.boolean(),
  licenseTemplate: z.array(licenseFieldSchema),
  description: z.string(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface ProductModalProps {
  editId: string | null;
  onClose: () => void;
}

export default function ProductModal({ editId, onClose }: ProductModalProps) {
  const { t } = useTranslation();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.products.byId(editId ?? ''),
    queryFn: () => getProduct(editId!),
    enabled: isEdit,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: '',
      groupId: '',
      name: { ARM: '', ENG: '', RUS: '' },
      isBlocked: false,
      hasUsers: false,
      licenseTemplate: [],
      description: '',
      tags: [],
    },
  });
  const { reset, register, handleSubmit } = methods;

  React.useEffect(() => {
    if (existing) {
      reset({
        productId: existing.productId,
        groupId: existing.groupId,
        name: existing.name,
        isBlocked: existing.isBlocked,
        hasUsers: existing.hasUsers,
        licenseTemplate: existing.licenseTemplate ?? [],
        description: existing.description ?? '',
        tags: (existing as any).tags ?? [],
      });
    }
  }, [existing, reset]);

  const invalidateKeys = [queryKeys.products.all];

  const { submit, isPending, mutationError } = useCrudMutations<FormValues>(
    {
      createFn: (v) => createProduct(v),
      updateFn: (v) =>
        updateProduct(existing!.id, { ...v, hash: (existing as Product).hash }),
      invalidateKeys,
      onClose,
    },
    isEdit,
  );

  const onSubmit = (v: FormValues) => submit(v);
  const { errorMessage, onValidationError } = useFormError(mutationError);

  const TABS = [
    { value: 'general', label: t('products.generalInfo') },
    { value: 'licenseTemplate', label: t('products.licenseTemplate') },
    { value: 'tags', label: t('tags.title') },
  ];

  return (
    <Modal isOpen onClose={onClose}
      title={isEdit ? t('products.editTitle') : t('products.createTitle')}
      size="3xl"
      footer={
        <>
          <Checkbox label={t('common.blocked')} {...register('isBlocked')} />
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose} disabled={isPending}>{t('common.cancel')}</Button>
          <Button type="submit" form="product-form" loading={isPending}>{t('common.save')}</Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="product-form" onSubmit={handleSubmit(onSubmit, onValidationError)} noValidate>
            <Tabs defaultTab="general" orientation="vertical">
              <TabList>
                {TABS.map((tab) => (
                  <TabTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabTrigger>
                ))}
              </TabList>
              <TabPanel value="general">
                <ProductGeneralInfoTab isEdit={isEdit} />
              </TabPanel>
              <TabPanel value="licenseTemplate">
                <ProductLicenseTemplateTab />
              </TabPanel>
              <TabPanel value="tags">
                <ProductTagsTab />
              </TabPanel>
            </Tabs>
            <ErrorBanner message={errorMessage} />
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
