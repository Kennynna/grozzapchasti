import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'grozzapchasti.accessToken'

const listeners = new Set<() => void>()

function readToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

export function getAccessToken(): string | null {
  return readToken()
}

export function setAccessToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY, token)
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // sessionStorage может быть недоступен
  }
  emit()
}

export function subscribeAccessToken(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAccessToken() {
  return useSyncExternalStore(subscribeAccessToken, getAccessToken, () => null)
}
