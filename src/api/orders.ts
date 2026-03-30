import { getRequest, postRequest } from '@/api/http'
import type { OrderCreateInput, OrderRead, Uuid } from '@/types/api'

export function createOrder(payload: OrderCreateInput) {
  return postRequest<OrderRead>('/api/v1/orders', payload)
}

export function getMyOrders() {
  return getRequest<OrderRead[]>('/api/v1/orders/me')
}

export function getOrder(orderId: Uuid) {
  return getRequest<OrderRead>(`/api/v1/orders/${orderId}`)
}
