import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/queries'

export const Route = createFileRoute('/admin/new')({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminNewLayout,
})

function AdminNewLayout() {
  return <Outlet />
}
