import { getRequest, patchRequest, postRequest } from '@/api/http'
import type {
  ApiEmptyResponse,
  OrderRead,
  OrderStatusUpdate,
  ProductCreate,
  ProductRead,
  ProductUpdate,
  Uuid,
} from '@/types/api'

export function createProduct(payload: ProductCreate) {
  return postRequest<ProductRead>('/api/v1/admin/products', payload)
}

export function updateProduct(productId: Uuid, payload: ProductUpdate) {
  return patchRequest<ProductRead>(`/api/v1/admin/products/${productId}`, payload)
}

export function listOrders(status?: string | null) {
  return getRequest<OrderRead[]>('/api/v1/admin/orders', { status })
}

export function updateOrderStatus(orderId: Uuid, payload: OrderStatusUpdate) {
  return patchRequest<OrderRead>(`/api/v1/admin/orders/${orderId}/status`, payload)
}

export function toggleSite(enabled: boolean) {
  return postRequest<ApiEmptyResponse>('/api/v1/admin/site/toggle', undefined, { enabled })
}
