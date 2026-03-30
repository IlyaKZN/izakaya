import { getRequest } from '@/api/http'
import type { OrderRead, UserRead } from '@/types/api'

export function getProfile() {
  return getRequest<UserRead>('/api/v1/users/me')
}

export function getMyUserOrders() {
  return getRequest<OrderRead[]>('/api/v1/users/me/orders')
}
