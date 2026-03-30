import { getAccessToken, getTokenType } from '@/api/auth-session'

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
  headers?: HeadersInit
  query?: QueryParams
}

function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(path, API_BASE_URL || window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined) return

      url.searchParams.set(key, String(value))
    })
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.startsWith('text/')) {
    return response.text()
  }

  return null
}

async function request<T>(method: string, path: string, options: RequestOptions = {}) {
  const accessToken = getAccessToken()
  const headers = new Headers(options.headers)

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `${getTokenType()} ${accessToken}`)
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(response.statusText || 'Request failed', response.status, data)
  }

  return data as T
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
