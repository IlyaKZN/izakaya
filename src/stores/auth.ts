import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  getTokenType,
  setAuthTokens,
  updateAccessToken,
} from '@/api/auth-session'
import type {
  ApiEmptyResponse,
  AuthRequestSMS,
  Token,
  TokenRefreshResponse,
  VerifySMSRequest,
} from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(getAccessToken())
  const refreshTokenValue = ref(getRefreshToken())
  const tokenType = ref(getTokenType())
  const loginSmsResult = ref<ApiEmptyResponse | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function syncTokens(tokens: Token) {
    setAuthTokens(tokens)
    accessToken.value = tokens.access_token
    refreshTokenValue.value = tokens.refresh_token
    tokenType.value = tokens.token_type ?? 'bearer'
  }

  function clearSession() {
    clearAuthTokens()
    accessToken.value = null
    refreshTokenValue.value = null
    tokenType.value = 'bearer'
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
    accessToken.value = response.access_token
    tokenType.value = response.token_type ?? 'bearer'

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

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    tokenType,
    loginSmsResult,
    isAuthenticated,
    loginSms,
    verifySms,
    refreshAccessToken,
    logout,
    clearSession,
  }
})
