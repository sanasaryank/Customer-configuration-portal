import { get, post, put, del } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Product,
  ProductListItem,
  ProductCreatePayload,
  ProductUpdatePayload,
} from '../types/product';

export async function getProducts(): Promise<ProductListItem[]> {
  return get<ProductListItem[]>(ENDPOINTS.PRODUCTS);
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

export async function deleteProduct(id: string): Promise<void> {
  return del(`${ENDPOINTS.PRODUCTS}/${id}`);
}
