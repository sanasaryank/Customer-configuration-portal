import { get, post, put } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Customer,
  CustomerListItem,
  CustomerCreatePayload,
  CustomerUpdatePayload,
} from '../types/customer';

export async function getCustomers(): Promise<CustomerListItem[]> {
  const result = await get<unknown>(ENDPOINTS.CUSTOMERS);
  if (Array.isArray(result)) return result as CustomerListItem[];
  return [];
}

export async function getCustomer(id: string): Promise<Customer> {
  return get<Customer>(`${ENDPOINTS.CUSTOMERS}/${id}`);
}

export async function createCustomer(
  payload: CustomerCreatePayload,
): Promise<Customer> {
  return post<Customer>(ENDPOINTS.CUSTOMERS, payload);
}

export async function updateCustomer(
  id: string,
  payload: CustomerUpdatePayload,
): Promise<Customer> {
  return put<Customer>(`${ENDPOINTS.CUSTOMERS}/${id}`, payload);
}

export async function moveLicense(srcId: string, dstId: string): Promise<void> {
  return post<void>(`${ENDPOINTS.CUSTOMERS_MOVE_LICENSE}/${dstId}`, { srcId });
}

export async function renewLicense(
  customerId: string,
  productIds: string[],
): Promise<Customer> {
  return post<Customer>(
    `${ENDPOINTS.CUSTOMERS_RENEW_LICENSE}/${customerId}`,
    productIds.map((productId) => ({ productId })),
  );
}


