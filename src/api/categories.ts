import { getRequest } from '@/api/http'
import type { CategoryRead } from '@/types/api'

export function listCategories() {
  return getRequest<CategoryRead[]>('/api/v1/categories')
}
