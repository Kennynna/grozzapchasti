import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { type FormEvent, useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AdminFieldLabel } from '@/components/admin/AdminFieldLabel'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { site } from '@/config/site'
import {
  getApiErrorDetails,
  getApiErrorMessage,
  useAccessToken,
  useIsAdmin,
  useLoginMutation,
  useMeQuery,
} from '@/queries'

export const Route = createFileRoute('/admin/login')({
  head: () => ({
    meta: [{ title: `Вход · ${site.name}` }],
  }),
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const token = useAccessToken()
  const me = useMeQuery()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAdmin) {
      void navigate({ to: '/' })
    }
  }, [isAdmin, navigate])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    loginMutation.mutate(
      { login, password },
      {
        onSuccess: () => {
          void navigate({ to: '/' })
        },
      },
    )
  }

  if (token && me.isPending) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <p className="text-sm text-muted-foreground">Проверяем сессию…</p>
      </div>
    )
  }

  if (isAdmin) {
    return null
  }

  const errorMessage = loginMutation.isError
    ? getApiErrorMessage(loginMutation.error)
    : null
  const errorDetails = loginMutation.isError
    ? getApiErrorDetails(loginMutation.error)
    : undefined

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl">Вход</h1>
      <p className="mt-3 text-sm text-muted-foreground">Только для администратора.</p>

      <form className="mt-8" onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <AdminFieldLabel htmlFor="admin-login" required>
              Логин
            </AdminFieldLabel>
            <Input
              id="admin-login"
              name="login"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="admin-password" required>
              Пароль
            </AdminFieldLabel>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
        </FieldGroup>

        {errorMessage ? (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Не удалось войти</AlertTitle>
            <AlertDescription>
              <p>{errorMessage}</p>
              {errorDetails?.length ? (
                <ul>
                  {errorDetails.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" className="mt-6 w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Входим…' : 'Войти'}
        </Button>
      </form>

      <Button className="mt-6" variant="ghost" asChild>
        <Link to="/">На витрину</Link>
      </Button>
    </div>
  )
}
