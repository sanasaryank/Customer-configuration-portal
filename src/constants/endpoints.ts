// Base URL — configure via VITE_API_BASE_URL env variable (default: empty = same origin)
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',

  // Main entities
  EMPLOYEES: '/employees',
  COUNTRIES: '/dictionary/countries',
  CITIES: '/dictionary/cities',
  DISTRICTS: '/dictionary/districts',
  PRODUCTS: '/products',
  CUSTOMERS: '/customers',
  CUSTOMERS_MOVE_LICENSE: '/customers/moveLicense',
  CUSTOMERS_RENEW_LICENSE: '/customers/renewLicense',

  // Working days
  WORKING_DAYS: '/workingDays',

  // History
  HISTORY_ACTIONS: '/history',
  HISTORY_ACTIONS_BY_OBJECT: '/history',
  HISTORY_ITEM: '/historyItem',
  HISTORY_LICENSE_MOVING: '/moveLicense',

  // Dictionaries
  DICT_INTEGRATION_TYPES: '/dictionary/integrationTypes',
  DICT_RESTAURANT_TYPES: '/dictionary/restaurantTypes',
  DICT_HOTEL_TYPES: '/dictionary/hotelTypes',
  DICT_MENU_TYPES: '/dictionary/menuTypes',
  DICT_PRICE_SEGMENTS: '/dictionary/priceSegments',
  DICT_PRODUCT_GROUPS: '/dictionary/productGroups',
  DICT_CUSTOMER_GROUPS: '/dictionary/customerGroups',
  DICT_CUSTOMER_STATUS: '/dictionary/customerStatus',
  DICT_LICENSE_TYPES: '/dictionary/licenseTypes',
  DICT_COUNTRIES: '/dictionary/countries',
  DICT_CITIES: '/dictionary/cities',
  DICT_DISTRICTS: '/dictionary/districts',

  // Validators
  VALIDATORS: '/validators',
} as const;

import type { DictionaryKey } from '../types/dictionary';

export const DICT_ENDPOINT_MAP: Record<DictionaryKey, string> = {
  integrationTypes: ENDPOINTS.DICT_INTEGRATION_TYPES,
  restaurantTypes: ENDPOINTS.DICT_RESTAURANT_TYPES,
  hotelTypes: ENDPOINTS.DICT_HOTEL_TYPES,
  menuTypes: ENDPOINTS.DICT_MENU_TYPES,
  priceSegments: ENDPOINTS.DICT_PRICE_SEGMENTS,
  productGroups: ENDPOINTS.DICT_PRODUCT_GROUPS,
  customerGroups: ENDPOINTS.DICT_CUSTOMER_GROUPS,
  customerStatus: ENDPOINTS.DICT_CUSTOMER_STATUS,
  licenseTypes: ENDPOINTS.DICT_LICENSE_TYPES,
  countries: ENDPOINTS.DICT_COUNTRIES,
  cities: ENDPOINTS.DICT_CITIES,
  districts: ENDPOINTS.DICT_DISTRICTS,
};
