import { useEffect } from 'react';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCustomer, createCustomer, updateCustomer } from '../../api/customers';
import { queryKeys } from '../../queryKeys';
import type {
  Customer,
  CustomerFormValues,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerFormUser,
} from '../../types/customer';
import { omitEmptyPasswords } from '../../utils/password';
import { unixToDateInput, dateInputToUnix } from '../../utils/timestamp';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs, TabList, TabTrigger, TabPanel } from '../../components/ui/Tabs';
import { GeneralInfoTab } from './tabs/GeneralInfoTab';
import { ContactInfoTab } from './tabs/ContactInfoTab';
import { LicenseInfoTab } from './tabs/LicenseInfoTab';
import { UsersTab } from './tabs/UsersTab';
import { CustomerTagsTab } from './tabs/TagsTab';

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
    isBlocked: z.boolean(),
  }),
  contactInfo: z.object({
    address: z.string(),
    legalAddress: z.string(),
    geo: z.object({
      countryId: z.string(),
      cityId: z.string(),
      districtId: z.string(),
      lat: z.coerce.number().catch(0),
      lng: z.coerce.number().catch(0),
    }),
    phone: z.string(),
    email: z.string(),
  }),
  licenseInfo: z.object({
    licenses: z.array(
      z.object({
        name: z.string(),
        hardwareKey: z.string(),
        appId: z.string(),
        products: z.array(
          z.object({
            productId: z.string(),
            licenseModeId: z.string().optional().or(z.literal('')),
            licenseTypeId: z.string().optional().or(z.literal('')),
            endDate: z.string(),
            track: z.boolean().default(false),
            licenseKey: z.string(),
            licenseData: z.record(z.unknown()),
          }),
        ),
        connectionInfo: z.object({
          connectionTypeId: z.string(),
          host: z.string(),
          port: z.coerce.number().catch(0),
          serverUsername: z.string(),
          serverPassword: z.string(),
          username: z.string(),
          password: z.string(),
        }),
      }),
    ).superRefine((licenses, ctx) => {
      const names = licenses.map((l) => l.name.trim());
      licenses.forEach((lic, i) => {
        const trimmed = lic.name.trim();
        if (trimmed && names.indexOf(trimmed) !== i) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'licenseNameDuplicate',
            path: [i, 'name'],
          });
        }
      });
    }),
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
  tags: z.array(z.string()),
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
      isBlocked: false,
    },
    contactInfo: {
      address: '',
      legalAddress: '',
      geo: { countryId: '', cityId: '', districtId: '', lat: 0, lng: 0 },
      phone: '',
      email: '',
    },
    licenseInfo: { licenses: [] },
    users: [],
    tags: [],
  };
}

// ---- Build write payload from form values ----

function buildCreatePayload(values: CustomerFormValues): CustomerCreatePayload {
  // Per-license: omit empty write-only passwords from connectionInfo
  const licenses = values.licenseInfo.licenses.map((lic) => {
    const conn = { ...lic.connectionInfo } as Record<string, unknown>;
    if (!conn['serverPassword']) delete conn['serverPassword'];
    if (!conn['password']) delete conn['password'];
    const products = lic.products.map((p) => {
      return { ...p, endDate: dateInputToUnix(p.endDate) };
    });
    return { name: lic.name, hardwareKey: lic.hardwareKey, appId: lic.appId, products, connectionInfo: conn };
  }) as unknown as CustomerCreatePayload['licenseInfo']['licenses'];

  // Omit empty passwords from users
  const users = values.users.map((u: CustomerFormUser) => {
    const cleaned = omitEmptyPasswords({ ...u } as Record<string, unknown>, ['password'] as string[]);
    return cleaned as unknown as CustomerFormUser;
  });

  return {
    generalInfo: values.generalInfo,
    contactInfo: values.contactInfo,
    licenseInfo: { licenses },
    users,
    tags: values.tags,
  };
}

function buildUpdatePayload(
  values: CustomerFormValues,
  existing: Customer,
): CustomerUpdatePayload {
  const base = buildCreatePayload(values);
  return { ...base, hash: existing.hash };
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

  // useForm with complex nested Zod schema: use type cast to avoid TS2589 deep instantiation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = (useForm as any)({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues(),
  }) as ReturnType<typeof useForm<CustomerFormValues>>;

  const { reset, register, handleSubmit, control } = methods;

  // Populate form from existing data (edit mode)
  useEffect(() => {
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reset({
        generalInfo: existing.generalInfo,
        contactInfo: existing.contactInfo,
        licenseInfo: {
          licenses: (Array.isArray(existing.licenseInfo?.licenses) ? existing.licenseInfo.licenses : []).map((lic) => ({
            name: lic.name,
            hardwareKey: lic.hardwareKey,
            appId: lic.appId,
            products: lic.products.map((p) => ({
              ...p,
              track: p.track ?? false,
              endDate: unixToDateInput(p.endDate),
            })),
            connectionInfo: {
              ...lic.connectionInfo,
              serverPassword: '', // never prefill write-only
              password: '',       // never prefill write-only
            },
          })),
        },
        users: (Array.isArray(existing.users) ? existing.users : []).map((u) => ({
          ...u,
          password: '', // never prefill write-only
        })),
        tags: (existing as any).tags ?? [],
      } as any);
    }
  }, [existing, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all, exact: true });
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
    clearValidationError();
    if (isEdit) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;
  const { errorMessage, onValidationError, clearValidationError } = useFormError(mutationError);

  const TABS = [
    { value: 'general', label: t('customers.generalInfo') },
    { value: 'contact', label: t('customers.contactInfo') },
    { value: 'license', label: t('customers.licenseInfo') },
    { value: 'users', label: t('customers.users') },
    { value: 'tags', label: t('tags.title') },
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? `${t('customers.editTitle')} (${existing?.id ?? '…'})` : t('customers.createTitle')}
      size="4xl"
      footer={
        <>
          <Checkbox
            label={t('common.blocked')}
            {...register('generalInfo.isBlocked')}
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
            onSubmit={handleSubmit(onSubmit, onValidationError)}
            noValidate
          >
            <Tabs defaultTab="general" orientation="vertical">
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
              <TabPanel value="license">
                <LicenseInfoTab isEdit={isEdit} />
              </TabPanel>
              <TabPanel value="users">
                <UsersTab isEdit={isEdit} />
              </TabPanel>
              <TabPanel value="tags">
                <CustomerTagsTab />
              </TabPanel>
            </Tabs>

            <ErrorBanner message={errorMessage} />
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
