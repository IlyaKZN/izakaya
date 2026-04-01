import { getRequest } from '@/api/http'
import type {
  CarouselImageRead,
  HealthResponse,
  PromotionResponse,
  SiteStatusResponse,
} from '@/types/api'

export function getSiteStatus() {
  return getRequest<SiteStatusResponse>('/api/v1/site/status')
}

export function getPromotions(orderPrice: number | string) {
  return getRequest<PromotionResponse>('/api/v1/site/promotions', { order_price: orderPrice })
}

export function getCarouselImages() {
  return getRequest<CarouselImageRead[]>('/api/v1/site/carousel')
}

export function getHealth() {
  return getRequest<HealthResponse>('/health')
}
