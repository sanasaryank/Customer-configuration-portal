import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getValidator,
  createValidator,
  updateValidator,
} from '../../api/validators';
import { queryKeys } from '../../queryKeys';
import type { ValidatorItem, SchemaNode } from '../../types/validator';
import { useCrudMutations } from '../../hooks/useCrudMutations';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs, TabList, TabTrigger, TabPanel } from '../../components/ui/Tabs';
import SchemaBuilder from './SchemaBuilder';
import { cleanSchema } from './schemaUtils';

const formSchema = z.object({
  version: z.string().min(1),
  endpoint: z.string().min(1),
  schema: z.record(z.any()),
});

type FormValues = z.infer<typeof formSchema>;

interface ValidatorModalProps {
  editId: string | null;
  copyFromId?: string | null;
  onClose: () => void;
}

export default function ValidatorModal({ editId, copyFromId, onClose }: ValidatorModalProps) {
  const { t } = useTranslation();
  const isEdit = editId !== null && !copyFromId;
  const sourceId = isEdit ? editId : copyFromId;

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.validators.byId(sourceId ?? ''),
    queryFn: () => getValidator(sourceId!),
    enabled: !!sourceId,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: '',
      endpoint: '',
      schema: { kind: 'object', fields: {}, required: [], allowExtra: true } as SchemaNode,
    },
  });

  React.useEffect(() => {
    if (existing) {
      reset({
        version: existing.version,
        endpoint: existing.endpoint,
        schema: JSON.parse(JSON.stringify(existing.schema)),
      });
    }
  }, [existing, reset]);

  const invalidateKeys = [queryKeys.validators.all];

  const { submit, isPending, mutationError } = useCrudMutations<FormValues>(
    {
      createFn: (v) => createValidator({ ...v, schema: v.schema as SchemaNode }),
      updateFn: (v) => updateValidator(existing!.id, {
        ...v,
        schema: v.schema as SchemaNode,
        hash: (existing as ValidatorItem).hash,
      }),
      invalidateKeys,
      onClose,
    },
    isEdit,
  );

  const onSubmit = (v: FormValues) => submit(v);
  const { errorMessage, onValidationError } = useFormError(mutationError);

  const title = isEdit ? t('validators.editTitle') : t('validators.createTitle');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={title}
      size="4xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="validator-form" loading={isPending}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      {(isEdit || copyFromId) && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <form
          id="validator-form"
          onSubmit={handleSubmit(onSubmit, onValidationError)}
          className="space-y-4"
          noValidate
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label={t('validators.version')}
                error={errors.version?.message}
                required
                {...register('version')}
              />
            </div>
            <div className="flex-1">
              <Input
                label={t('validators.endpoint')}
                error={errors.endpoint?.message}
                required
                {...register('endpoint')}
              />
            </div>
          </div>

          <fieldset className="border border-gray-200 rounded-md p-4">
            <legend className="text-sm font-medium text-gray-700 px-1">
              {t('validators.schema')}
            </legend>
            <Tabs defaultTab="builder">
              <TabList>
                <TabTrigger value="builder">{t('validators.builder')}</TabTrigger>
                <TabTrigger value="json">{t('validators.jsonPreview')}</TabTrigger>
              </TabList>
              <TabPanel value="builder">
                <Controller
                  control={control}
                  name="schema"
                  render={({ field }) => (
                    <SchemaBuilder
                      value={field.value as SchemaNode}
                      onChange={field.onChange}
                    />
                  )}
                />
              </TabPanel>
              <TabPanel value="json">
                <Controller
                  control={control}
                  name="schema"
                  render={({ field }) => (
                    <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs font-mono overflow-auto max-h-[60vh] whitespace-pre text-gray-800">
                      {JSON.stringify(cleanSchema(field.value as SchemaNode), null, 2)}
                    </pre>
                  )}
                />
              </TabPanel>
            </Tabs>
          </fieldset>

          <ErrorBanner message={errorMessage} />
        </form>
      )}
    </Modal>
  );
}
