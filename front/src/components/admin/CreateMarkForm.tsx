import { type FormEvent, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FormError } from '@/components/admin/FormError'
import { ImageField } from '@/components/admin/ImageField'
import { optionalText } from '@/components/admin/form-utils'
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
import { useCreateMarkMutation, type Mark } from '@/queries'

type CreateMarkFormProps = {
  onCreated?: (mark: Mark) => void
}

export function CreateMarkForm({ onCreated }: CreateMarkFormProps) {
  const navigate = useNavigate()
  const mutation = useCreateMarkMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
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
        images: images.length ? images : undefined,
      },
      {
        onSuccess: (mark) => {
          toast.success('Марка создана')
          if (onCreated) {
            onCreated(mark)
            return
          }
          void navigate({ to: '/' })
        },
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <AdminFieldLabel htmlFor="mark-name" required>
            Название
          </AdminFieldLabel>
          <Input
            id="mark-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <AdminFieldLabel htmlFor="mark-description">Описание</AdminFieldLabel>
          <Textarea
            id="mark-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field>
          <AdminFieldLabel>Фото</AdminFieldLabel>
          <ImageField files={images} onChange={setImages} disabled={mutation.isPending} />
        </Field>
      </FieldGroup>
      {mutation.isError ? <FormError error={mutation.error} /> : null}
      <Button type="submit" disabled={!valid || mutation.isPending}>
        {mutation.isPending ? 'Сохраняем…' : 'Создать'}
      </Button>
    </form>
  )
}

export function CreateMarkModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (mark: Mark) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая марка</DialogTitle>
        </DialogHeader>
        {open ? (
          <CreateMarkForm
            onCreated={(mark) => {
              onCreated(mark)
              onOpenChange(false)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
