import { ROUTES } from './routes';

export interface FilterOption {
  value: string;
  /** Pre-resolved display string (for dynamically registered options). */
  label?: string;
  /** i18n key (for static options defined here in configs). */
  labelKey?: string;
}

export type FilterFieldType = 'text' | 'date' | 'switch' | 'select';

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
    { key: 'name',         labelKey: 'common.name',                  type: 'text' },
    { key: 'group',        labelKey: 'customers.groupId',             type: 'select' },
    { key: 'productTypes', labelKey: 'customers.productTypes',        type: 'select' },
    { key: 'licenseMode',  labelKey: 'customers.licenseMode',         type: 'select',
      staticOptions: [
        { value: 'monthly',  labelKey: 'licenseModes.monthly' },
        { value: 'yearly',   labelKey: 'licenseModes.yearly' },
        { value: 'manual',   labelKey: 'licenseModes.manual' },
        { value: 'temporary', labelKey: 'licenseModes.temporary' },
        { value: 'lifetime', labelKey: 'licenseModes.lifetime' },
      ],
    },
    { key: 'licenseType',  labelKey: 'customers.licenseTypeFilter',   type: 'select' },
    { key: 'status',       labelKey: 'customers.statusId',            type: 'select' },
    STATUS_SWITCH,
  ],
  [ROUTES.PRODUCTS]: [
    { key: 'groupName', labelKey: 'products.group', type: 'select' },
    { key: 'name',      labelKey: 'common.name',    type: 'text' },
    STATUS_SWITCH,
  ],
  [ROUTES.HISTORY_ACTIONS]: [
    { key: 'dateFrom',   labelKey: 'history.dateFrom',   type: 'date' },
    { key: 'dateTo',     labelKey: 'history.dateTo',     type: 'date' },
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
  [ROUTES.HISTORY_LICENSE_MOVING]: [
    { key: 'dateFrom',   labelKey: 'licenseMoving.dateFrom',  type: 'date' },
    { key: 'dateTo',     labelKey: 'licenseMoving.dateTo',    type: 'date' },
    { key: 'from',       labelKey: 'licenseMoving.from',      type: 'select' },
    { key: 'to',         labelKey: 'licenseMoving.to',        type: 'select' },
    { key: 'user',       labelKey: 'licenseMoving.user',      type: 'select' },
    { key: 'product',    labelKey: 'licenseMoving.product',   type: 'select' },
    { key: 'licenseId',  labelKey: 'licenseMoving.licenseId', type: 'text' },
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
  [ROUTES.LICENSE_TYPES]:     [{ key: 'name', labelKey: 'common.name', type: 'text' }, STATUS_SWITCH],
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
  [ROUTES.VALIDATORS]: [
    { key: 'version',  labelKey: 'validators.version',  type: 'text' },
    { key: 'endpoint', labelKey: 'validators.endpoint', type: 'text' },
  ],
};
