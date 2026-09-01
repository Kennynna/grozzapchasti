import { Link, createFileRoute } from '@tanstack/react-router'
import { CreateModelForm } from '@/components/admin/CreateModelForm'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

export const Route = createFileRoute('/admin/new/model')({
  head: () => ({
    meta: [{ title: `Новая модель · ${site.name}` }],
  }),
  component: NewModelPage,
})

function NewModelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl">Новая модель</h1>
      <div className="mt-8">
        <CreateModelForm />
      </div>
      <Button className="mt-6" variant="ghost" asChild>
        <Link to="/">На витрину</Link>
      </Button>
    </div>
  )
}
