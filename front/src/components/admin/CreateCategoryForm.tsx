import { type FormEvent, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FormError } from '@/components/admin/FormError'
import { optionalText } from '@/components/admin/form-utils'
import { MutationBusy, SubmitButton } from '@/components/mutation-ui'
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
import { useCreateCategoryMutation, type Category } from '@/queries'

type CreateCategoryFormProps = {
  onCreated?: (category: Category) => void
}

export function CreateCategoryForm({ onCreated }: CreateCategoryFormProps) {
  const navigate = useNavigate()
  const mutation = useCreateCategoryMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const valid = name.trim().length > 0

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid) {
      return
    }
    mutation.mutate(
      {
        name: name.trim(),
        description: optionalText(description),
      },
      {
        onSuccess: (category) => {
          toast.success('Категория создана')
          if (onCreated) {
            onCreated(category)
            return
          }
          void navigate({ to: '/' })
        },
      },
    )
  }

  return (
    <MutationBusy pending={mutation.isPending}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FieldGroup>
          <Field>
            <AdminFieldLabel htmlFor="category-name" required>
              Название
            </AdminFieldLabel>
            <Input
              id="category-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="category-description">Описание</AdminFieldLabel>
            <Textarea
              id="category-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </FieldGroup>
        {mutation.isError ? <FormError error={mutation.error} /> : null}
        <SubmitButton type="submit" pending={mutation.isPending} pendingLabel="Создаём" disabled={!valid}>
          Создать
        </SubmitButton>
      </form>
    </MutationBusy>
  )
}

export function CreateCategoryModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (category: Category) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая категория</DialogTitle>
        </DialogHeader>
        {open ? (
          <CreateCategoryForm
            onCreated={(category) => {
              onCreated(category)
              onOpenChange(false)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
