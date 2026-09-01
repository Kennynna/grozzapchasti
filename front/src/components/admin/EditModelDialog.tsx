import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { CreateMarkModal } from '@/components/admin/CreateMarkForm'
import { EntitySelect } from '@/components/admin/EntitySelect'
import { FormError } from '@/components/admin/FormError'
import { ImageField } from '@/components/admin/ImageField'
import { isTextDirty } from '@/components/admin/form-utils'
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
  imageFilename,
  useDeleteModelImageMutation,
  useMarksQuery,
  useUpdateModelMutation,
  type Model,
  type ModelWriteInput,
} from '@/queries'

export function EditModelDialog({
  model,
  open,
  onOpenChange,
}: {
  model?: Model
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать модель</DialogTitle>
        </DialogHeader>
        {open && model ? (
          <EditModelForm key={model.id} model={model} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EditModelForm({ model, onDone }: { model: Model; onDone: () => void }) {
  const marksQuery = useMarksQuery()
  const mutation = useUpdateModelMutation()
  const deleteImage = useDeleteModelImageMutation()
  const [name, setName] = useState(model.name)
  const [description, setDescription] = useState(model.description ?? '')
  const [markId, setMarkId] = useState(model.markId)
  const [images, setImages] = useState<File[]>([])
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const marks = marksQuery.data ?? []
  const valid = name.trim().length > 0 && Boolean(markId)
  const dirty =
    isTextDirty(name, model.name) ||
    isTextDirty(description, model.description) ||
    markId !== model.markId ||
    images.length > 0

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !dirty || !markId) {
      return
    }
    const input: ModelWriteInput = {}
    if (isTextDirty(name, model.name)) {
      input.name = name.trim()
    }
    if (isTextDirty(description, model.description)) {
      input.description = description.trim()
    }
    if (markId !== model.markId) {
      input.markId = markId
    }
    if (images.length) {
      input.images = images
    }
    mutation.mutate(
      { id: model.id, ...input },
      {
        onSuccess: () => {
          toast.success('Модель сохранена')
          onDone()
        },
      },
    )
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <FieldGroup>
          <Field>
            <AdminFieldLabel htmlFor="edit-model-mark" required>
              Марка
            </AdminFieldLabel>
            <EntitySelect
              id="edit-model-mark"
              items={marks}
              value={markId}
              onChange={setMarkId}
              onAdd={() => setMarkModalOpen(true)}
              placeholder="Выберите марку"
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="edit-model-name" required>
              Название
            </AdminFieldLabel>
            <Input
              id="edit-model-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="edit-model-description">Описание</AdminFieldLabel>
            <Textarea
              id="edit-model-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <Field>
            <AdminFieldLabel>Фото</AdminFieldLabel>
            <ImageField
              files={images}
              onChange={setImages}
              existing={model.images}
              removingExisting={
                deleteImage.isPending && deleteImage.variables
                  ? model.images.find(
                      (path) => imageFilename(path) === deleteImage.variables.filename,
                    )
                  : undefined
              }
              onRemoveExisting={(path) =>
                deleteImage.mutate(
                  { id: model.id, filename: imageFilename(path) },
                  { onError: (error) => toast.error(error.message) },
                )
              }
              disabled={mutation.isPending || deleteImage.isPending}
            />
          </Field>
        </FieldGroup>
        {mutation.isError ? <FormError error={mutation.error} /> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Отмена
          </Button>
          <Button type="submit" disabled={!valid || !dirty || mutation.isPending}>
            {mutation.isPending ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </div>
      </form>
      <CreateMarkModal
        open={markModalOpen}
        onOpenChange={setMarkModalOpen}
        onCreated={(mark) => setMarkId(mark.id)}
      />
    </>
  )
}
