import { getRequest } from '@/api/http'
import type {
  CheckZoneResponse,
  ReverseResponse,
  SearchResponse,
  SuggestResponse,
} from '@/types/api'

export function suggestAddresses(query: string, limit?: number) {
  return getRequest<SuggestResponse>('/api/v1/geo/suggest', { query, limit })
}

export function searchAddress(query: string) {
  return getRequest<SearchResponse>('/api/v1/geo/search', { query })
}

export function reverseGeocode(lat: number, lon: number) {
  return getRequest<ReverseResponse>('/api/v1/geo/reverse', { coords: `${lat},${lon}` })
}

export function checkDeliveryZone(lat: number, lon: number) {
  return getRequest<CheckZoneResponse>('/api/v1/geo/check-zone', { coords: `${lat},${lon}` })
}
