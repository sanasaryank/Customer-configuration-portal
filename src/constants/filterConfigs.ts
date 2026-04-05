import { ROUTES } from './routes';

export interface FilterOption {
  value: string;
  /** Pre-resolved display string (for dynamically registered options). */
  label?: string;
  /** i18n key (for static options defined here in configs). */
  labelKey?: string;
}

export type FilterFieldType = 'text' | 'switch' | 'select';

export interface FilterFieldConfig {
  key: string;
  labelKey: string;
  type?: FilterFieldType; // default 'text'
  /** Fixed options for select fields whose values are known at build time. */
  staticOptions?: FilterOption[];
}

/** Shared "Active" switch added to every list that has isBlocked. */
const STATUS_SWITCH: FilterFieldConfig = {
  key: 'isBlocked',
  labelKey: 'common.status',
  type: 'switch',
};

/**
 * Centralized per-route filter field definitions.
 * FilterPanel reads this to render dedicated filter inputs.
 * Keys must match the filterFields[].key used in each page's useListOperations call.
 * Routes NOT listed here get no FilterPanel (panel hidden completely).
 */
export const FILTER_CONFIGS: Record<string, FilterFieldConfig[]> = {
  [ROUTES.CUSTOMERS]: [
    { key: 'name',         labelKey: 'common.name',           type: 'text' },
    { key: 'group',        labelKey: 'customers.groupId',     type: 'select' },
    { key: 'productTypes', labelKey: 'customers.productTypes',type: 'select' },
    { key: 'status',       labelKey: 'customers.statusId',    type: 'select' },
    STATUS_SWITCH,
  ],
  [ROUTES.PRODUCTS]: [
    { key: 'groupName', labelKey: 'products.group', type: 'select' },
    { key: 'name',      labelKey: 'common.name',    type: 'text' },
    STATUS_SWITCH,
  ],
  [ROUTES.HISTORY]: [
    { key: 'date',       labelKey: 'history.date',       type: 'text' },
    { key: 'username',   labelKey: 'history.user',       type: 'select' },
    { key: 'objectType', labelKey: 'history.objectType', type: 'text' },
    {
      key: 'action', labelKey: 'history.actionType', type: 'select',
      staticOptions: [
        { value: 'create', labelKey: 'history.create' },
        { value: 'update', labelKey: 'history.update' },
        { value: 'delete', labelKey: 'history.delete' },
      ],
    },
  ],
  [ROUTES.EMPLOYEES]: [
    { key: 'name', labelKey: 'common.name', type: 'text' },
    STATUS_SWITCH,
  ],
  [ROUTES.INTEGRATION_TYPES]: [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.RESTAURANT_TYPES]:  [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.HOTEL_TYPES]:       [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.MENU_TYPES]:        [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.PRICE_SEGMENTS]:    [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.PRODUCT_GROUPS]:    [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.CUSTOMER_GROUPS]:   [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.CUSTOMER_STATUS]:   [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  [ROUTES.COUNTRIES]:         [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
  // key must match geoConfig.parentField used in DictionaryPage filterFields
  [ROUTES.CITIES]: [
    { key: 'countryId', labelKey: 'cities.country', type: 'select' },
    { key: 'name',      labelKey: 'common.name',    type: 'text' },
    STATUS_SWITCH,
  ],
  [ROUTES.DISTRICTS]: [
    { key: 'cityId', labelKey: 'districts.city', type: 'select' },
    { key: 'name',   labelKey: 'common.name',    type: 'text' },
    STATUS_SWITCH,
  ],
};
