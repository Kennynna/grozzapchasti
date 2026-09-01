import { API_URL } from '@/config/constants'
import { getAccessToken, setAccessToken } from './auth-token'

export class ApiError extends Error {
  statusCode: number
  details?: string[]

  constructor(statusCode: number, message: string, details?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

type JsonValue = string | number | boolean | null
type JsonFields = Record<string, JsonValue | undefined>

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  json?: JsonFields
  files?: File[]
  query?: Record<string, string | number | undefined>
}

type ErrorBody = {
  statusCode?: number
  message?: string | string[]
  details?: string[]
}

function withQuery(
  path: string,
  query?: Record<string, string | number | undefined>,
) {
  if (!query) {
    return path
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value))
    }
  }

  const search = params.toString()
  return search ? `${path}?${search}` : path
}

function encodeBody(json?: JsonFields, files?: File[]) {
  if (files?.length) {
    const form = new FormData()
    if (json) {
      for (const [key, value] of Object.entries(json)) {
        if (value === undefined) {
          continue
        }
        form.append(key, value === null ? '' : String(value))
      }
    }
    for (const file of files) {
      form.append('images', file)
    }
    return { body: form, contentType: null }
  }

  if (json) {
    const payload: Record<string, JsonValue> = {}
    for (const [key, value] of Object.entries(json)) {
      if (value !== undefined) {
        payload[key] = value
      }
    }
    return {
      body: JSON.stringify(payload),
      contentType: 'application/json',
    }
  }

  return { body: undefined, contentType: null }
}

function messageFromBody(body: ErrorBody, fallback: string) {
  if (Array.isArray(body.message)) {
    return body.message.join(', ')
  }
  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message
  }
  return fallback
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Неизвестная ошибка'
}

export function getApiErrorDetails(error: unknown) {
  return error instanceof ApiError ? error.details : undefined
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', json, files, query } = options
  const headers = new Headers()
  const token = getAccessToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const { body, contentType } = encodeBody(json, files)
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  const response = await fetch(`${API_URL}${withQuery(path, query)}`, {
    method,
    headers,
    body,
  })

  const raw = await response.text()
  let parsed: unknown = null
  if (raw) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }
  }

  if (!response.ok) {
    const errorBody =
      parsed && typeof parsed === 'object' ? (parsed as ErrorBody) : {}
    if (response.status === 401) {
      setAccessToken(null)
    }
    throw new ApiError(
      errorBody.statusCode ?? response.status,
      messageFromBody(errorBody, response.statusText),
      errorBody.details,
    )
  }

  return parsed as T
}
