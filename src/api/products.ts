import { get, post, put } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Product,
  ProductListItem,
  ProductCreatePayload,
  ProductUpdatePayload,
} from '../types/product';

export async function getProducts(): Promise<ProductListItem[]> {
  const result = await get<unknown>(ENDPOINTS.PRODUCTS);
  if (Array.isArray(result)) return result as ProductListItem[];
  return [];
}

export async function getProduct(id: string): Promise<Product> {
  return get<Product>(`${ENDPOINTS.PRODUCTS}/${id}`);
}

export async function createProduct(
  payload: ProductCreatePayload,
): Promise<Product> {
  return post<Product>(ENDPOINTS.PRODUCTS, payload);
}

export async function updateProduct(
  id: string,
  payload: ProductUpdatePayload,
): Promise<Product> {
  return put<Product>(`${ENDPOINTS.PRODUCTS}/${id}`, payload);
}


