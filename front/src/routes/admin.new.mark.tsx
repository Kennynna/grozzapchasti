import { Link, createFileRoute } from '@tanstack/react-router'
import { CreateMarkForm } from '@/components/admin/CreateMarkForm'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

export const Route = createFileRoute('/admin/new/mark')({
  head: () => ({
    meta: [{ title: `Новая марка · ${site.name}` }],
  }),
  component: NewMarkPage,
})

function NewMarkPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl">Новая марка</h1>
      <div className="mt-8">
        <CreateMarkForm />
      </div>
      <Button className="mt-6" variant="ghost" asChild>
        <Link to="/">На витрину</Link>
      </Button>
    </div>
  )
}
