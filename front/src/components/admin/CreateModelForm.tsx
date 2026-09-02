import { type FormEvent, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CreateMarkModal } from '@/components/admin/CreateMarkForm'
import { EntitySelect } from '@/components/admin/EntitySelect'
import { FormError } from '@/components/admin/FormError'
import { ImageField } from '@/components/admin/ImageField'
import { optionalText } from '@/components/admin/form-utils'
import { MutationBusy, SubmitButton } from '@/components/mutation-ui'
import { FormFieldSkeleton } from '@/components/query-skeletons'
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
import { useCreateModelMutation, useMarksQuery, type Model } from '@/queries'

type CreateModelFormProps = {
  defaultMarkId?: number
  onCreated?: (model: Model) => void
}

export function CreateModelForm({ defaultMarkId, onCreated }: CreateModelFormProps) {
  const navigate = useNavigate()
  const marksQuery = useMarksQuery()
  const mutation = useCreateModelMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [markId, setMarkId] = useState(defaultMarkId)
  const [images, setImages] = useState<File[]>([])
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const marks = marksQuery.data ?? []
  const valid = name.trim().length > 0 && Boolean(markId)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !markId) {
      return
    }
    mutation.mutate(
      {
        name: name.trim(),
        markId,
        description: optionalText(description),
        images: images.length ? images : undefined,
      },
      {
        onSuccess: (model) => {
          toast.success('Модель создана')
          if (onCreated) {
            onCreated(model)
            return
          }
          void navigate({ to: '/' })
        },
      },
    )
  }

  return (
    <>
      <MutationBusy pending={mutation.isPending}>
        <form onSubmit={onSubmit} className="space-y-6">
        <FieldGroup>
          {marksQuery.isPending ? (
            <FormFieldSkeleton />
          ) : (
            <Field>
              <AdminFieldLabel htmlFor="model-mark" required>
                Марка
              </AdminFieldLabel>
              <EntitySelect
                id="model-mark"
                items={marks}
                value={markId}
                onChange={setMarkId}
                onAdd={() => setMarkModalOpen(true)}
                placeholder="Выберите марку"
              />
            </Field>
          )}
          <Field>
            <AdminFieldLabel htmlFor="model-name" required>
              Название
            </AdminFieldLabel>
            <Input
              id="model-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="model-description">Описание</AdminFieldLabel>
            <Textarea
              id="model-description"
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
        <SubmitButton type="submit" pending={mutation.isPending} pendingLabel="Создаём" disabled={!valid}>
          Создать
        </SubmitButton>
      </form>
      </MutationBusy>
      <CreateMarkModal
        open={markModalOpen}
        onOpenChange={setMarkModalOpen}
        onCreated={(mark) => setMarkId(mark.id)}
      />
    </>
  )
}

export function CreateModelModal({
  open,
  onOpenChange,
  defaultMarkId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMarkId?: number
  onCreated: (model: Model) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая модель</DialogTitle>
        </DialogHeader>
        {open ? (
          <CreateModelForm
            defaultMarkId={defaultMarkId}
            onCreated={(model) => {
              onCreated(model)
              onOpenChange(false)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
