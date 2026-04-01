import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  getTokenType,
  updateAccessToken,
} from '@/api/auth-session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

type Primitive = string | number | boolean
type QueryValue = Primitive | null | undefined
type QueryParams = Record<string, QueryValue>

type RequestOptions = {
  body?: unknown
  headers?: Record<string, string>
  query?: QueryParams
}

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const http = axios.create({
  baseURL: API_BASE_URL || undefined,
})

const authHttp = axios.create({
  baseURL: API_BASE_URL || undefined,
})

let refreshRequest: Promise<string> | null = null

http.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.set('Authorization', `${getTokenType()} ${accessToken}`)
  }

  return config
})

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('Refresh token is missing')
  }

  const response = await authHttp.post<{ access_token: string; token_type?: string }>(
    '/api/v1/auth/refresh',
    {
      refresh_token: refreshToken,
    },
  )

  const nextAccessToken = response.data.access_token
  const nextTokenType = response.data.token_type ?? 'bearer'

  updateAccessToken(nextAccessToken, nextTokenType)

  return nextAccessToken
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url === '/api/v1/auth/refresh'
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshRequest ??= refreshAccessToken().finally(() => {
        refreshRequest = null
      })

      const nextAccessToken = await refreshRequest
      originalRequest.headers.set('Authorization', `${getTokenType()} ${nextAccessToken}`)

      return http.request(originalRequest)
    } catch (refreshError) {
      clearAuthTokens()
      return Promise.reject(refreshError)
    }
  },
)

function sanitizeQuery(query?: QueryParams) {
  if (!query) return undefined

  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== null && value !== undefined),
  )
}

async function request<T>(method: string, path: string, options: RequestOptions = {}) {
  try {
    const response = await http.request<T>({
      url: path,
      method: method as AxiosRequestConfig['method'],
      data: options.body,
      params: sanitizeQuery(options.query),
      headers: options.headers,
    })

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.statusText || error.message || 'Request failed',
        error.response?.status ?? 0,
        error.response?.data ?? null,
      )
    }

    throw error
  }
}

export function getRequest<T>(path: string, query?: QueryParams) {
  return request<T>('GET', path, { query })
}

export function postRequest<T>(path: string, body?: unknown, query?: QueryParams) {
  return request<T>('POST', path, { body, query })
}

export function patchRequest<T>(path: string, body?: unknown, query?: QueryParams) {
  return request<T>('PATCH', path, { body, query })
}

export function deleteRequest<T>(path: string, query?: QueryParams) {
  return request<T>('DELETE', path, { query })
}
