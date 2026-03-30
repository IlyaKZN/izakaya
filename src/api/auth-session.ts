import type { Token } from '@/types/api'

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const TOKEN_TYPE_KEY = 'auth_token_type'
const authSessionListeners = new Set<(session: AuthSessionSnapshot) => void>()

export type AuthSessionSnapshot = {
  accessToken: string | null
  refreshToken: string | null
  tokenType: string
}

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

export function readAuthSession(): AuthSessionSnapshot {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    tokenType: getTokenType(),
  }
}

function notifyAuthSessionListeners() {
  const session = readAuthSession()

  authSessionListeners.forEach((listener) => listener(session))
}

export function subscribeToAuthSession(listener: (session: AuthSessionSnapshot) => void) {
  authSessionListeners.add(listener)

  return () => {
    authSessionListeners.delete(listener)
  }
}

export function setAuthTokens(tokens: Token) {
  if (!canUseStorage()) return

  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  window.localStorage.setItem(TOKEN_TYPE_KEY, tokens.token_type ?? 'bearer')
  notifyAuthSessionListeners()
}

export function updateAccessToken(accessToken: string, tokenType = 'bearer') {
  if (!canUseStorage()) return

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
  notifyAuthSessionListeners()
}

export function clearAuthTokens() {
  if (!canUseStorage()) return

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(TOKEN_TYPE_KEY)
  notifyAuthSessionListeners()
}
