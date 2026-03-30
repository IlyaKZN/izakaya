import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import {
  clearAuthTokens,
  readAuthSession,
  setAuthTokens,
  subscribeToAuthSession,
  updateAccessToken,
  updateAuthRole,
} from '@/api/auth-session'
import type {
  ApiEmptyResponse,
  AuthRole,
  AuthRequestSMS,
  Token,
  TokenRefreshResponse,
  VerifySMSRequest,
} from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const session = readAuthSession()
  const accessToken = ref(session.accessToken)
  const refreshTokenValue = ref(session.refreshToken)
  const tokenType = ref(session.tokenType)
  const role = ref(session.role)
  const loginSmsResult = ref<ApiEmptyResponse | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function syncTokens(tokens: Token) {
    setAuthTokens(tokens)
  }

  function clearSession() {
    clearAuthTokens()
  }

  function setRole(nextRole: AuthRole | null) {
    updateAuthRole(nextRole)
  }

  async function loginSms(payload: AuthRequestSMS) {
    const response = await authApi.loginSms(payload)
    loginSmsResult.value = response

    return response
  }

  async function verifySms(payload: VerifySMSRequest) {
    const tokens = await authApi.verifySms(payload)
    syncTokens(tokens)

    return tokens
  }

  async function refreshAccessToken() {
    if (!refreshTokenValue.value) {
      throw new Error('Refresh token is missing')
    }

    const response: TokenRefreshResponse = await authApi.refreshToken({
      refresh_token: refreshTokenValue.value,
    })

    updateAccessToken(response.access_token, response.token_type ?? 'bearer')

    return response
  }

  async function logout() {
    try {
      const response = await authApi.logout()
      clearSession()

      return response
    } catch (error) {
      clearSession()
      throw error
    }
  }

  subscribeToAuthSession((nextSession) => {
    accessToken.value = nextSession.accessToken
    refreshTokenValue.value = nextSession.refreshToken
    tokenType.value = nextSession.tokenType
    role.value = nextSession.role
  })

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    tokenType,
    role,
    loginSmsResult,
    isAuthenticated,
    loginSms,
    verifySms,
    refreshAccessToken,
    logout,
    clearSession,
    setRole,
  }
})
