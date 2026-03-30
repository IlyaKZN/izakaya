import type { Token } from '@/types/api'

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const TOKEN_TYPE_KEY = 'auth_token_type'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getAccessToken() {
  if (!canUseStorage()) return null

  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (!canUseStorage()) return null

  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getTokenType() {
  if (!canUseStorage()) return 'bearer'

  return window.localStorage.getItem(TOKEN_TYPE_KEY) ?? 'bearer'
}

export function setAuthTokens(tokens: Token) {
  if (!canUseStorage()) return

  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  window.localStorage.setItem(TOKEN_TYPE_KEY, tokens.token_type ?? 'bearer')
}

export function updateAccessToken(accessToken: string, tokenType = 'bearer') {
  if (!canUseStorage()) return

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
}

export function clearAuthTokens() {
  if (!canUseStorage()) return

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(TOKEN_TYPE_KEY)
}
