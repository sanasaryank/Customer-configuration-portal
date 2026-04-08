import type { DictionaryKey } from './types/dictionary';

export const queryKeys = {
  // Auth
  me: ['me'] as const,

  // Employees
  employees: {
    all: ['employees'] as const,
    byId: (id: string) => ['employees', id] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    byId: (id: string) => ['products', id] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    byId: (id: string) => ['customers', id] as const,
  },

  // Working days (scoped per country)
  workingDays: (countryId: string) => ['workingDays', countryId] as const,

  // History
  history: {
    all: ['history', 'actions'] as const,
    byObjectId: (objectId: string) => ['history', 'actions', objectId] as const,
    item: (id: number) => ['historyItem', id] as const,
    licenseMoving: ['history', 'licenseMoving'] as const,
  },

  // Dictionaries (includes countries, cities, districts)
  dict: (key: DictionaryKey) => ['dictionary', key] as const,
  dictById: (key: DictionaryKey, id: string) =>
    ['dictionary', key, id] as const,

  // Geo aliases — point to dictionary cache for backward compat
  countries: {
    all: ['dictionary', 'countries'] as const,
    byId: (id: string) => ['dictionary', 'countries', id] as const,
  },
  cities: {
    all: ['dictionary', 'cities'] as const,
    byId: (id: string) => ['dictionary', 'cities', id] as const,
  },
  districts: {
    all: ['dictionary', 'districts'] as const,
    byId: (id: string) => ['dictionary', 'districts', id] as const,
  },
  // Validators
  validators: {
    all: ['validators'] as const,
    byId: (id: string) => ['validators', id] as const,
  },
} as const;
