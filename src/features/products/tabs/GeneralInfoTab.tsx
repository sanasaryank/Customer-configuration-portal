import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getDictionary } from '../../../api/dictionaries';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Textarea } from '../../../components/ui/Textarea';
import { TranslationEditor } from '../../../components/form/TranslationEditor';
import { DictionarySelect } from '../../../components/form/DictionarySelect';

export function ProductGeneralInfoTab({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { register, formState: { errors } } = useFormContext();

  const { data: productGroups = [] } = useQuery({
    queryKey: queryKeys.dict('productGroups'),
    queryFn: () => getDictionary('productGroups'),
  });

  return (
    <div className="space-y-4">
      <Input label={t('products.productId')} error={errors.productId?.message as string | undefined} required {...register('productId')} />
      <TranslationEditor fieldName="name" label={t('common.name')} required defaultExpanded={!isEdit} />
      <DictionarySelect name="groupId" label={t('products.group')} items={productGroups} lang={lang} required />
      <Checkbox label={t('products.hasUsers')} {...register('hasUsers')} />
      <Textarea label={t('common.description')} error={errors.description?.message as string | undefined} {...register('description')} />
    </div>
  );
}
