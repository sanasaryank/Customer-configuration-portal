import { get, post, put, del } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Customer,
  CustomerListItem,
  CustomerCreatePayload,
  CustomerUpdatePayload,
} from '../types/customer';

export async function getCustomers(): Promise<CustomerListItem[]> {
  return get<CustomerListItem[]>(ENDPOINTS.CUSTOMERS);
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

export async function deleteCustomer(id: string): Promise<void> {
  return del(`${ENDPOINTS.CUSTOMERS}/${id}`);
}
