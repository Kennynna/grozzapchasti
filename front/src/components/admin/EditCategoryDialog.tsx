import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/admin/FormError'
import { isTextDirty } from '@/components/admin/form-utils'
import { MutationBusy, SubmitButton } from '@/components/mutation-ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminFieldLabel } from '@/components/admin/AdminFieldLabel'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useUpdateCategoryMutation,
  type Category,
  type CategoryWriteInput,
} from '@/queries'

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать категорию</DialogTitle>
        </DialogHeader>
        {open && category ? (
          <EditCategoryForm
            key={category.id}
            category={category}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryForm({
  category,
  onDone,
}: {
  category: Category
  onDone: () => void
}) {
  const mutation = useUpdateCategoryMutation()
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description ?? '')
  const valid = name.trim().length > 0
  const dirty =
    isTextDirty(name, category.name) || isTextDirty(description, category.description)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !dirty) {
      return
    }
    const input: CategoryWriteInput = {}
    if (isTextDirty(name, category.name)) {
      input.name = name.trim()
    }
    if (isTextDirty(description, category.description)) {
      input.description = description.trim()
    }
    mutation.mutate(
      { id: category.id, ...input },
      {
        onSuccess: () => {
          toast.success('Категория сохранена')
          onDone()
        },
      },
    )
  }

  return (
    <MutationBusy pending={mutation.isPending}>
    <form onSubmit={onSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <AdminFieldLabel htmlFor="edit-category-name" required>
            Название
          </AdminFieldLabel>
          <Input
            id="edit-category-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <AdminFieldLabel htmlFor="edit-category-description">Описание</AdminFieldLabel>
          <Textarea
            id="edit-category-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </FieldGroup>
      {mutation.isError ? <FormError error={mutation.error} /> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onDone}>
          Отмена
        </Button>
        <SubmitButton
          type="submit"
          pending={mutation.isPending}
          pendingLabel="Сохраняем"
          disabled={!valid || !dirty}
        >
          Сохранить
        </SubmitButton>
      </div>
    </form>
    </MutationBusy>
  )
}
