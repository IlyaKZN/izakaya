import { deleteRequest, getRequest, patchRequest, postRequest } from '@/api/http'
import type {
  ApiEmptyResponse,
  CarouselImageRead,
  OrderRead,
  OrderStatusUpdate,
  PromocodeCreate,
  PromocodeRead,
  PromotionCreate,
  PromotionRead,
  PromotionUpdate,
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

export function deleteProduct(productId: Uuid) {
  return deleteRequest<void>(`/api/v1/admin/products/${productId}`)
}

export function uploadProductImage(productId: Uuid, image: File) {
  const formData = new FormData()
  formData.append('image', image)

  return postRequest<ProductRead>(`/api/v1/admin/products/${productId}/image`, formData)
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

export function listPromocodes() {
  return getRequest<PromocodeRead[]>('/api/v1/admin/promocodes')
}

export function createPromocode(payload: PromocodeCreate) {
  return postRequest<PromocodeRead>('/api/v1/admin/promocodes', payload)
}

export function deletePromocode(promocodeId: Uuid) {
  return deleteRequest<void>(`/api/v1/admin/promocodes/${promocodeId}`)
}

export function listPromotions() {
  return getRequest<PromotionRead[]>('/api/v1/admin/promotions')
}

export function createPromotion(payload: PromotionCreate) {
  return postRequest<PromotionRead>('/api/v1/admin/promotions', payload)
}

export function updatePromotion(promotionId: Uuid, payload: PromotionUpdate) {
  return patchRequest<PromotionRead>(`/api/v1/admin/promotions/${promotionId}`, payload)
}

export function deletePromotion(promotionId: Uuid) {
  return deleteRequest<void>(`/api/v1/admin/promotions/${promotionId}`)
}

export function listCarouselImages() {
  return getRequest<CarouselImageRead[]>('/api/v1/admin/carousel')
}

export function uploadCarouselImage(image: File, sortOrder?: number) {
  const formData = new FormData()
  formData.append('image', image)

  return postRequest<CarouselImageRead>('/api/v1/admin/carousel', formData, {
    sort_order: sortOrder,
  })
}

export function deleteCarouselImage(imageId: Uuid) {
  return deleteRequest<void>(`/api/v1/admin/carousel/${imageId}`)
}
