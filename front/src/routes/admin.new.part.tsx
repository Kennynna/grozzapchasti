import { Link, createFileRoute } from '@tanstack/react-router'
import { CreatePartForm } from '@/components/admin/CreatePartForm'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

export const Route = createFileRoute('/admin/new/part')({
  head: () => ({
    meta: [{ title: `Новая запчасть · ${site.name}` }],
  }),
  component: NewPartPage,
})

function NewPartPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl">Новая запчасть</h1>
      <div className="mt-8">
        <CreatePartForm />
      </div>
      <Button className="mt-6" variant="ghost" asChild>
        <Link to="/">На витрину</Link>
      </Button>
    </div>
  )
}
