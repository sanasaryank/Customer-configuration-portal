import type { Translation, JsonValue } from './common';

// ----- Sub-shapes -----

export interface CustomerGeo {
  countryId: string;
  cityId: string;
  districtId: string;
  lat: number;
  lng: number;
}

export interface CustomerGeneralInfo {
  responsibleId: string;
  statusId: string;
  name: Translation;
  legalName: Translation;
  crmLink: string;
  groupId: string;
  brandName: string;
  tin: string;
  bankAccount: string;
  description: string;
}

export interface CustomerContactInfo {
  address: string;
  legalAddress: string;
  geo: CustomerGeo;
  phone: string;
  email: string;
}

// Connection info as returned by GET (no write-only passwords)
export interface CustomerConnectionInfo {
  connectionTypeId: string;
  host: string;
  port: number;
  serverUsername: string;
  username: string;
}

// licenseData is a dynamic object whose keys match licenseTemplate[].name
export type LicenseData = Record<string, JsonValue>;

export interface CustomerLicenseProduct {
  productId: string;
  licenseKey: string;
  licenseData: LicenseData;
  movedFrom: string;
  movedTo: string;
}

export interface CustomerLicenseInfo {
  hardwareKey: string;
  products: CustomerLicenseProduct[];
}

// Customer user as returned by GET (no password)
export interface CustomerUser {
  id: string;
  name: Translation;
  restoreEmail: string;
  username: string;
  allowedProducts: string[];
  isBlocked: boolean;
}

// ----- Top-level shapes -----

export interface CustomerListItem {
  id: string;
  generalInfo: CustomerGeneralInfo;
  contactInfo: CustomerContactInfo;
  connectionInfo: CustomerConnectionInfo;
  products: string[];
  licenseInfo: CustomerLicenseInfo;
  users: CustomerUser[];
  isBlocked: boolean;
}

export interface Customer extends CustomerListItem {
  hash: string;
}

// ----- Write payloads -----

// Write form of connection info (includes write-only passwords)
export interface CustomerConnectionInfoWrite extends CustomerConnectionInfo {
  serverPassword?: string;
  password?: string;
}

// Write form of customer user (includes write-only password)
export interface CustomerUserWrite {
  id?: string;
  name: Translation;
  restoreEmail: string;
  username: string;
  password?: string;
  allowedProducts: string[];
  isBlocked: boolean;
}

export interface CustomerCreatePayload {
  generalInfo: CustomerGeneralInfo;
  contactInfo: CustomerContactInfo;
  connectionInfo: CustomerConnectionInfoWrite;
  products: string[];
  licenseInfo: CustomerLicenseInfo;
  users: CustomerUserWrite[];
  isBlocked: boolean;
}

export interface CustomerUpdatePayload extends CustomerCreatePayload {
  id: string;
  hash: string;
}

// ----- Form values -----
// Used in react-hook-form — includes write-only password fields

export interface CustomerFormConnectionInfo {
  connectionTypeId: string;
  host: string;
  port: number;
  serverUsername: string;
  serverPassword: string; // write-only, empty by default
  username: string;
  password: string; // write-only, empty by default
}

export interface CustomerFormUser {
  id: string; // empty string for new users
  name: Translation;
  restoreEmail: string;
  username: string;
  password: string; // write-only, empty by default
  allowedProducts: string[];
  isBlocked: boolean;
}

export interface CustomerFormValues {
  generalInfo: CustomerGeneralInfo;
  contactInfo: CustomerContactInfo;
  connectionInfo: CustomerFormConnectionInfo;
  products: string[];
  licenseInfo: CustomerLicenseInfo;
  users: CustomerFormUser[];
  isBlocked: boolean;
}
