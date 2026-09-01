import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { setAccessToken, useAccessToken } from './auth-token'
import { apiRequest } from './http'
import type { Admin, LoginResponse } from './types'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export async function login(loginValue: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    json: { login: loginValue, password },
  })
}

export async function getMe() {
  return apiRequest<Admin>('/auth/me')
}

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: getMe,
    }),
}

export function useMeQuery() {
  const token = useAccessToken()
  return useQuery({
    ...authQueries.me(),
    enabled: Boolean(token),
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { login: string; password: string }) =>
      login(input.login, input.password),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      queryClient.setQueryData(authKeys.me(), data.admin)
    },
  })
}

export function logout() {
  setAccessToken(null)
}

export function useIsAdmin() {
  const token = useAccessToken()
  const me = useMeQuery()
  return Boolean(token) && me.isSuccess
}
