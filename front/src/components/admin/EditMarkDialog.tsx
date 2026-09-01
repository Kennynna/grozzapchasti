import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
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
  useDeleteMarkImageMutation,
  useUpdateMarkMutation,
  type Mark,
  type MarkWriteInput,
} from '@/queries'

export function EditMarkDialog({
  mark,
  open,
  onOpenChange,
}: {
  mark?: Mark
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать марку</DialogTitle>
        </DialogHeader>
        {open && mark ? (
          <EditMarkForm key={mark.id} mark={mark} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EditMarkForm({ mark, onDone }: { mark: Mark; onDone: () => void }) {
  const mutation = useUpdateMarkMutation()
  const deleteImage = useDeleteMarkImageMutation()
  const [name, setName] = useState(mark.name)
  const [description, setDescription] = useState(mark.description ?? '')
  const [images, setImages] = useState<File[]>([])
  const valid = name.trim().length > 0
  const dirty =
    isTextDirty(name, mark.name) || isTextDirty(description, mark.description) || images.length > 0

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !dirty) {
      return
    }
    const input: MarkWriteInput = {}
    if (isTextDirty(name, mark.name)) {
      input.name = name.trim()
    }
    if (isTextDirty(description, mark.description)) {
      input.description = description.trim()
    }
    if (images.length) {
      input.images = images
    }
    mutation.mutate(
      { id: mark.id, ...input },
      {
        onSuccess: () => {
          toast.success('Марка сохранена')
          onDone()
        },
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <AdminFieldLabel htmlFor="edit-mark-name" required>
            Название
          </AdminFieldLabel>
          <Input
            id="edit-mark-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <AdminFieldLabel htmlFor="edit-mark-description">Описание</AdminFieldLabel>
          <Textarea
            id="edit-mark-description"
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
            existing={mark.images}
            removingExisting={
              deleteImage.isPending && deleteImage.variables
                ? mark.images.find(
                    (path) => imageFilename(path) === deleteImage.variables.filename,
                  )
                : undefined
            }
            onRemoveExisting={(path) =>
              deleteImage.mutate(
                { id: mark.id, filename: imageFilename(path) },
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
  )
}
