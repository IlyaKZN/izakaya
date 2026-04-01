import { postRequest } from '@/api/http'
import type {
  ApiEmptyResponse,
  AuthRequestSMS,
  Token,
  TokenRefreshRequest,
  TokenRefreshResponse,
  VerifySMSRequest,
} from '@/types/api'

export function loginSms(payload: AuthRequestSMS) {
  return postRequest<ApiEmptyResponse>('/api/v1/auth/login/sms', payload)
}

export function verifySms(payload: VerifySMSRequest) {
  return postRequest<Token>('/api/v1/auth/verify/sms', payload)
}

export function refreshToken(payload: TokenRefreshRequest) {
  return postRequest<TokenRefreshResponse>('/api/v1/auth/refresh', payload)
}

export function logout(payload: TokenRefreshRequest) {
  return postRequest<ApiEmptyResponse>('/api/v1/auth/logout', payload)
}
