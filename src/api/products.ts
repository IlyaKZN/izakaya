import { getRequest } from '@/api/http'
import type { ProductRead, Uuid } from '@/types/api'

export function listProducts(categoryId?: Uuid | null) {
  return getRequest<ProductRead[]>('/api/v1/products', { category_id: categoryId })
}

export function searchProducts(query: string) {
  return getRequest<ProductRead[]>('/api/v1/products/search', { q: query })
}

export function getProduct(productId: Uuid) {
  return getRequest<ProductRead>(`/api/v1/products/${productId}`)
}

export function getSimilarProducts(productId: Uuid) {
  return getRequest<ProductRead[]>(`/api/v1/products/${productId}/similar`)
}
