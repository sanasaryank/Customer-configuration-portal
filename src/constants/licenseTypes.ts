export const LICENSE_TYPE_IDS = ['monthly', 'yearly', 'manual', 'lifetime'] as const;
export type LicenseTypeId = (typeof LICENSE_TYPE_IDS)[number];
