import { get, post, put } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Employee,
  EmployeeListItem,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
} from '../types/employee';

export async function getEmployees(): Promise<EmployeeListItem[]> {
  const result = await get<unknown>(ENDPOINTS.EMPLOYEES);
  if (Array.isArray(result)) return result as EmployeeListItem[];
  return [];
}

export async function getEmployee(id: string): Promise<Employee> {
  return get<Employee>(`${ENDPOINTS.EMPLOYEES}/${id}`);
}

export async function createEmployee(
  payload: EmployeeCreatePayload,
): Promise<Employee> {
  return post<Employee>(ENDPOINTS.EMPLOYEES, payload);
}

export async function updateEmployee(
  id: string,
  payload: EmployeeUpdatePayload,
): Promise<Employee> {
  return put<Employee>(`${ENDPOINTS.EMPLOYEES}/${id}`, payload);
}


