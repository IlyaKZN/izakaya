import { getRequest, patchRequest } from '@/api/http'
import type { UserRead, UserUpdate } from '@/types/api'

export function getProfile() {
  return getRequest<UserRead>('/api/v1/users/me')
}

export function updateProfile(payload: UserUpdate) {
  return patchRequest<UserRead>('/api/v1/users/me', payload)
}
