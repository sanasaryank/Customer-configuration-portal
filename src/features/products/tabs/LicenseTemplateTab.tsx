import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

const KIND_OPTIONS = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'boolean', label: 'Boolean' },
];

export function ProductLicenseTemplateTab() {
  const { t } = useTranslation();
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'licenseTemplate' });
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2 bg-gray-50 p-2 rounded">
          <Input
            placeholder={t('products.fieldName')}
            error={(errors.licenseTemplate as any)?.[index]?.name?.message}
            required
            {...register(`licenseTemplate.${index}.name`)}
          />
          <Select
            options={KIND_OPTIONS}
            error={(errors.licenseTemplate as any)?.[index]?.kind?.message}
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
            onClick={() => setDeleteIndex(index)}
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

      <ConfirmDialog
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => { if (deleteIndex !== null) { remove(deleteIndex); setDeleteIndex(null); } }}
        title={t('products.removeFieldTitle')}
        message={t('products.removeFieldMessage')}
      />
    </div>
  );
}
