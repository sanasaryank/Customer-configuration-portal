export const LICENSE_MODE_IDS = ['monthly', 'yearly', 'manual', 'temporary', 'lifetime'] as const;
export type LicenseModeId = (typeof LICENSE_MODE_IDS)[number];
