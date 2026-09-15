import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { site } from '@/config/site'
import { getAccessToken } from '@/queries'

export const Route = createFileRoute('/admin/new')({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: '/admin/login' })
    }
  },
  head: () => ({
    meta: [
      { title: `Админ · ${site.name}` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminNewLayout,
})

function AdminNewLayout() {
  return <Outlet />
}
