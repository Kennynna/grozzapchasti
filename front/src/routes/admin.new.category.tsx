import { Link, createFileRoute } from '@tanstack/react-router'
import { CreateCategoryForm } from '@/components/admin/CreateCategoryForm'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

export const Route = createFileRoute('/admin/new/category')({
  head: () => ({
    meta: [{ title: `Новая категория · ${site.name}` }],
  }),
  component: NewCategoryPage,
})

function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl">Новая категория</h1>
      <div className="mt-8">
        <CreateCategoryForm />
      </div>
      <Button className="mt-6" variant="ghost" asChild>
        <Link to="/">На витрину</Link>
      </Button>
    </div>
  )
}
