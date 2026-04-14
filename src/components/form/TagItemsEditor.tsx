import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TranslationEditor } from './TranslationEditor';

interface TagItemsEditorProps {
  fieldName: string;
}

export function TagItemsEditor({ fieldName }: TagItemsEditorProps) {
  const { t } = useTranslation();
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: fieldName });

  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Resolve nested error
  const getItemError = (index: number, field: string): string | undefined => {
    const arr = (errors as Record<string, unknown>)[fieldName];
    if (!Array.isArray(arr)) return undefined;
    const item = arr[index] as Record<string, { message?: string }> | undefined;
    return item?.[field]?.message;
  };

  return (
    <fieldset className="border border-gray-200 rounded-md p-3">
      <legend className="text-sm font-medium text-gray-700 px-1">
        {t('tags.items')}
      </legend>
      <div className="space-y-3">
        {fields.map((field, index) => {
          const isExpanded = expandedSet.has(field.id);
          return (
            <div key={field.id} className="border border-gray-100 rounded bg-gray-50">
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
                onClick={() => toggleExpand(field.id)}
              >
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <span className="text-gray-400">{isExpanded ? '▾' : '▸'}</span>
                  {t('tags.item')} #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={(e) => { e.stopPropagation(); setDeleteIndex(index); }}
                >
                  ✕
                </Button>
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <Input
                    label={t('common.id')}
                    error={getItemError(index, 'id')}
                    required
                    {...register(`${fieldName}.${index}.id`)}
                  />
                  <TranslationEditor fieldName={`${fieldName}.${index}.name`} label={t('common.name')} required />
                  <Textarea
                    label={t('common.description')}
                    {...register(`${fieldName}.${index}.description`)}
                  />
                  <Checkbox
                    label={t('common.blocked')}
                    {...register(`${fieldName}.${index}.isBlocked`)}
                  />
                </div>
              )}
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            append({ id: '', name: { ARM: '', ENG: '', RUS: '' }, description: '', isBlocked: false });
          }}
        >
          + {t('tags.addItem')}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => { if (deleteIndex !== null) { remove(deleteIndex); setDeleteIndex(null); } }}
        message={t('common.confirmDelete')}
      />
    </fieldset>
  );
}
