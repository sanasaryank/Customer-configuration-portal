import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../../api/tags';
import { queryKeys } from '../../queryKeys';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import { Checkbox } from '../ui/Checkbox';
import { Spinner } from '../ui/Spinner';
import type { TagDictionaryKey } from '../../types/tag';

interface TagSelectorProps {
  /** Which tag dictionary to load: 'customerTags' | 'productTags' */
  tagKey: TagDictionaryKey;
  /** Form field name, e.g. 'tags' */
  name: string;
}

export function TagSelector({ tagKey, name }: TagSelectorProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { control } = useFormContext();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: queryKeys.tag(tagKey),
    queryFn: () => getTags(tagKey),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  const activeTags = tags.filter((tag) => !tag.isBlocked);

  if (activeTags.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        {t('common.noData')}
      </p>
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];
        const toggle = (itemId: string) => {
          field.onChange(
            selected.includes(itemId)
              ? selected.filter((x) => x !== itemId)
              : [...selected, itemId],
          );
        };

        return (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activeTags.map((tag) => {
              const activeItems = tag.items.filter(
                (item) => !item.isBlocked || selected.includes(item.id),
              );
              if (activeItems.length === 0) return null;
              return (
                <fieldset
                  key={tag.id}
                  className="border border-gray-200 rounded-md p-3"
                >
                  <legend className="text-sm font-medium text-gray-700 px-1">
                    {resolveTranslation(tag.name, lang)}
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    {activeItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded border border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onChange={() => toggle(item.id)}
                          disabled={item.isBlocked}
                        />
                        <span className="text-sm">
                          {resolveTranslation(item.name, lang)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        );
      }}
    />
  );
}
