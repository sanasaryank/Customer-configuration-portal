import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getEmployee, createEmployee, updateEmployee } from '../../api/employees';
import { queryKeys } from '../../queryKeys';
import type { Employee } from '../../types/employee';
import { omitEmptyPasswords } from '../../utils/password';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { useCrudMutations } from '../../hooks/useCrudMutations';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { PasswordField } from '../../components/form/PasswordField';
import { Spinner } from '../../components/ui/Spinner';

const schema = z.object({
  username: z.string().min(1),
  password: z.string(),
  name: z.object({ ARM: z.string(), ENG: z.string(), RUS: z.string() }),
  role: z.enum(['admin', 'superadmin']),
  isBlocked: z.boolean(),
  description: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeModalProps {
  editId: string | null; // null = create mode
  onClose: () => void;
}

export default function EmployeeModal({ editId, onClose }: EmployeeModalProps) {
  const { t } = useTranslation();
  const isEdit = editId !== null;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.employees.byId(editId ?? ''),
    queryFn: () => getEmployee(editId!),
    enabled: isEdit,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(
      isEdit
        ? schema
        : schema.extend({ password: z.string().min(1, t('common.required')) }),
    ),
    defaultValues: {
      username: '',
      password: '',
      name: { ARM: '', ENG: '', RUS: '' },
      role: 'admin',
      isBlocked: false,
      description: '',
    },
  });

  const { reset, register, handleSubmit, formState: { errors } } = methods;

  React.useEffect(() => {
    if (existing) {
      reset({
        username: existing.username,
        password: '', // per spec: never prefill password
        name: existing.name,
        role: existing.role,
        isBlocked: existing.isBlocked,
        description: existing.description ?? '',
      });
    }
  }, [existing, reset]);

  const invalidateKeys = [
    queryKeys.employees.all,
    ...(editId ? [queryKeys.employees.byId(editId)] : []),
  ];

  const { submit, isPending, mutationError } = useCrudMutations<FormValues>(
    {
      createFn: (values) =>
        createEmployee({ ...values, password: values.password }),
      updateFn: (values) => {
        const cleaned = omitEmptyPasswords(values, ['password']);
        return updateEmployee(existing!.id, {
          ...cleaned,
          id: (existing as Employee).id,
          hash: (existing as Employee).hash,
        } as Parameters<typeof updateEmployee>[1]);
      },
      invalidateKeys,
      onClose,
    },
    isEdit,
  );

  const onSubmit = (values: FormValues) => submit(values);
  const { errorMessage, onValidationError, clearValidationError } = useFormError(mutationError);

  const roleOptions = [
    { value: 'admin', label: t('employees.admin') },
    { value: 'superadmin', label: t('employees.superadmin') },
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? t('employees.editTitle') : t('employees.createTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="employee-form" loading={isPending}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      {isEdit && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <FormProvider {...methods}>
          <form
            id="employee-form"
            onSubmit={handleSubmit(onSubmit, onValidationError)}
            className="space-y-4"
            noValidate
          >
            <Input
              id="emp-username"
              label={t('employees.username')}
              error={errors.username?.message}
              required
              {...register('username')}
            />

            <PasswordField
              name="password"
              label={t('employees.password')}
              hint={isEdit ? t('employees.passwordHint') : undefined}
              required={!isEdit}
            />

            <TranslationEditor fieldName="name" label={t('common.name')} />

            <Select
              id="emp-role"
              label={t('employees.role')}
              options={roleOptions}
              error={errors.role?.message}
              required
              {...register('role')}
            />

            <Textarea
              label={t('common.description')}
              error={errors.description?.message}
              {...register('description')}
            />

            <Checkbox
              label={t('employees.isBlocked')}
              {...register('isBlocked')}
            />

            <ErrorBanner message={errorMessage} />
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
