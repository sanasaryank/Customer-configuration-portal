import React, { useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCustomer, createCustomer, updateCustomer } from '../../api/customers';
import { getProducts } from '../../api/products';
import { queryKeys } from '../../queryKeys';
import type {
  Customer,
  CustomerFormValues,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerFormConnectionInfo,
  CustomerFormUser,
} from '../../types/customer';
import { omitEmptyPasswordsNested, omitEmptyPasswords } from '../../utils/password';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs, TabList, TabTrigger, TabPanel } from '../../components/ui/Tabs';
import { GeneralInfoTab } from './tabs/GeneralInfoTab';
import { ContactInfoTab } from './tabs/ContactInfoTab';
import { ConnectionInfoTab } from './tabs/ConnectionInfoTab';
import { ProductsTab } from './tabs/ProductsTab';
import { LicenseInfoTab } from './tabs/LicenseInfoTab';
import { UsersTab } from './tabs/UsersTab';

// ---- Zod schema ----

const translationSchema = z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() });

const schema = z.object({
  generalInfo: z.object({
    responsibleId: z.string(),
    statusId: z.string(),
    name: translationSchema,
    legalName: translationSchema,
    crmLink: z.string(),
    groupId: z.string(),
    brandName: z.string(),
    tin: z.string(),
    bankAccount: z.string(),
    description: z.string(),
  }),
  contactInfo: z.object({
    address: z.string(),
    legalAddress: z.string(),
    geo: z.object({
      countryId: z.string(),
      cityId: z.string(),
      districtId: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
    phone: z.string(),
    email: z.string(),
  }),
  connectionInfo: z.object({
    connectionTypeId: z.string(),
    host: z.string(),
    port: z.number(),
    serverUsername: z.string(),
    serverPassword: z.string(), // write-only, empty by default
    username: z.string(),
    password: z.string(), // write-only, empty by default
  }),
  products: z.array(z.string()),
  licenseInfo: z.object({
    hardwareKey: z.string(),
    products: z.array(
      z.object({
        productId: z.string(),
        licenseKey: z.string(),
        licenseData: z.record(z.unknown()),
        movedFrom: z.string(),
        movedTo: z.string(),
      }),
    ),
  }),
  users: z.array(
    z.object({
      id: z.string(),
      name: translationSchema,
      restoreEmail: z.string(),
      username: z.string(),
      password: z.string(),
      allowedProducts: z.array(z.string()),
      isBlocked: z.boolean(),
    }),
  ),
  isBlocked: z.boolean(),
});

// ---- Default values ----

function defaultFormValues(): CustomerFormValues {
  return {
    generalInfo: {
      responsibleId: '',
      statusId: '',
      name: { ARM: '', ENG: '', RUS: '' },
      legalName: { ARM: '', ENG: '', RUS: '' },
      crmLink: '',
      groupId: '',
      brandName: '',
      tin: '',
      bankAccount: '',
      description: '',
    },
    contactInfo: {
      address: '',
      legalAddress: '',
      geo: { countryId: '', cityId: '', districtId: '', lat: 0, lng: 0 },
      phone: '',
      email: '',
    },
    connectionInfo: {
      connectionTypeId: '',
      host: '',
      port: 0,
      serverUsername: '',
      serverPassword: '',
      username: '',
      password: '',
    },
    products: [],
    licenseInfo: { hardwareKey: '', products: [] },
    users: [],
    isBlocked: false,
  };
}

// ---- Build write payload from form values ----

function buildCreatePayload(values: CustomerFormValues): CustomerCreatePayload {
  // Omit empty passwords from connectionInfo
  const connInfo = omitEmptyPasswordsNested(
    values.connectionInfo as unknown as Record<string, unknown>,
    'serverPassword' as never,
    [],
  );
  // Actually do it properly:
  const connectionInfoWrite: CustomerFormConnectionInfo & { serverPassword?: string; password?: string } = {
    ...values.connectionInfo,
  };
  if (!connectionInfoWrite.serverPassword) delete connectionInfoWrite.serverPassword;
  if (!connectionInfoWrite.password) delete connectionInfoWrite.password;

  // Omit empty passwords from users
  const users = values.users.map((u: CustomerFormUser) => {
    const cleaned = omitEmptyPasswords({ ...u }, ['password'] as (keyof typeof u)[]);
    return cleaned as CustomerFormUser;
  });

  return {
    generalInfo: values.generalInfo,
    contactInfo: values.contactInfo,
    connectionInfo: connectionInfoWrite,
    products: values.products,
    licenseInfo: values.licenseInfo,
    users,
    isBlocked: values.isBlocked,
  };
}

function buildUpdatePayload(
  values: CustomerFormValues,
  existing: Customer,
): CustomerUpdatePayload {
  const base = buildCreatePayload(values);
  return { ...base, id: existing.id, hash: existing.hash };
}

// ---- Component ----

interface CustomerModalProps {
  editId: string | null;
  onClose: () => void;
}

export default function CustomerModal({ editId, onClose }: CustomerModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.customers.byId(editId ?? ''),
    queryFn: () => getCustomer(editId!),
    enabled: isEdit,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  const productMap = React.useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts],
  );

  const methods = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues(),
  });

  const { reset, register, handleSubmit, control, setValue, formState: { errors } } = methods;

  // Populate form from existing data (edit mode)
  useEffect(() => {
    if (existing) {
      reset({
        generalInfo: existing.generalInfo,
        contactInfo: existing.contactInfo,
        connectionInfo: {
          ...existing.connectionInfo,
          serverPassword: '', // never prefill write-only
          password: '',       // never prefill write-only
        },
        products: existing.products ?? [],
        licenseInfo: existing.licenseInfo ?? { hardwareKey: '', products: [] },
        users: (existing.users ?? []).map((u) => ({
          ...u,
          password: '', // never prefill write-only
        })),
        isBlocked: existing.isBlocked,
      });
    }
  }, [existing, reset]);

  // Watch products to auto-add license blocks when a new product with licenseTemplate is selected
  const watchedProducts = useWatch({ control, name: 'products' }) ?? [];
  const watchedLicenseProducts = useWatch({ control, name: 'licenseInfo.products' }) ?? [];

  useEffect(() => {
    for (const productId of watchedProducts) {
      const product = productMap.get(productId);
      if (!product?.licenseTemplate?.length) continue;
      const alreadyHas = watchedLicenseProducts.some((lp) => lp.productId === productId);
      if (!alreadyHas) {
        const newBlock = {
          productId,
          licenseKey: '',
          licenseData: {},
          movedFrom: '',
          movedTo: '',
        };
        setValue('licenseInfo.products', [...watchedLicenseProducts, newBlock]);
      }
    }
    // Note: per spec §5.7.5, we do NOT remove blocks when product is removed.
    // Removed products show as disabled in LicenseInfoTab.
  }, [watchedProducts, watchedLicenseProducts, productMap, setValue]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.customers.byId(editId) });
  };

  const createMutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      createCustomer(buildCreatePayload(values)),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      updateCustomer(existing!.id, buildUpdatePayload(values, existing as Customer)),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const onSubmit = (values: CustomerFormValues) => {
    if (isEdit) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const TABS = [
    { value: 'general', label: t('customers.generalInfo') },
    { value: 'contact', label: t('customers.contactInfo') },
    { value: 'connection', label: t('customers.connectionInfo') },
    { value: 'products', label: t('customers.products') },
    { value: 'license', label: t('customers.licenseInfo') },
    { value: 'users', label: t('customers.users') },
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? t('customers.editTitle') : t('customers.createTitle')}
      size="2xl"
      footer={
        <>
          <Checkbox
            label={t('common.blocked')}
            {...register('isBlocked')}
          />
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="customer-form" loading={isPending}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <FormProvider {...methods}>
          <form
            id="customer-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <Tabs defaultTab="general">
              <TabList>
                {TABS.map((tab) => (
                  <TabTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabTrigger>
                ))}
              </TabList>

              <TabPanel value="general">
                <GeneralInfoTab />
              </TabPanel>
              <TabPanel value="contact">
                <ContactInfoTab />
              </TabPanel>
              <TabPanel value="connection">
                <ConnectionInfoTab isEdit={isEdit} />
              </TabPanel>
              <TabPanel value="products">
                <ProductsTab />
              </TabPanel>
              <TabPanel value="license">
                <LicenseInfoTab />
              </TabPanel>
              <TabPanel value="users">
                <UsersTab isEdit={isEdit} />
              </TabPanel>
            </Tabs>

            {mutationError && (
              <p className="mt-3 text-sm text-red-600">{t('common.errorOccurred')}</p>
            )}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
