import { getRequest } from '@/api/http'
import type { HealthResponse, SiteStatusResponse } from '@/types/api'

export function getSiteStatus() {
  return getRequest<SiteStatusResponse>('/api/v1/site/status')
}

export function getHealth() {
  return getRequest<HealthResponse>('/health')
}
