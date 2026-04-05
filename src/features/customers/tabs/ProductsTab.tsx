import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../../api/products';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import { resolveTranslation } from '../../../utils/translation';
import { Checkbox } from '../../../components/ui/Checkbox';

export function ProductsTab() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  const activeProducts = Array.isArray(allProducts) ? allProducts.filter((p) => !p.isBlocked) : [];

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">
        {t('customers.products')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
        {activeProducts.map((product) => (
          <label
            key={product.id}
            className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(product.id)}
              onChange={() => toggle(product.id)}
            />
            <span className="text-sm">
              {resolveTranslation(product.name, lang)}
            </span>
          </label>
        ))}
        {activeProducts.length === 0 && (
          <p className="text-sm text-gray-400 col-span-2 py-4 text-center">
            {t('common.noData')}
          </p>
        )}
      </div>
    </div>
  );
}
