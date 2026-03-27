import type { DictionaryKey } from './types/dictionary';

export const queryKeys = {
  // Auth
  me: ['me'] as const,

  // Employees
  employees: {
    all: ['employees'] as const,
    byId: (id: string) => ['employees', id] as const,
  },

  // Countries
  countries: {
    all: ['countries'] as const,
    byId: (id: string) => ['countries', id] as const,
  },

  // Cities
  cities: {
    all: ['cities'] as const,
    byId: (id: string) => ['cities', id] as const,
  },

  // Districts
  districts: {
    all: ['districts'] as const,
    byId: (id: string) => ['districts', id] as const,
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

  // Working days
  workingDays: ['workingDays'] as const,

  // History
  history: {
    all: ['history'] as const,
    byObjectId: (objectId: string) => ['history', objectId] as const,
    item: (id: number) => ['historyItem', id] as const,
  },

  // Dictionaries
  dict: (key: DictionaryKey) => ['dictionary', key] as const,
  dictById: (key: DictionaryKey, id: string) =>
    ['dictionary', key, id] as const,
} as const;
