import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { CreateCategoryModal } from '@/components/admin/CreateCategoryForm'
import { FormError } from '@/components/admin/FormError'
import { ImageField } from '@/components/admin/ImageField'
import { PartFitFields } from '@/components/admin/PartFitFields'
import { isTextDirty, optionalText } from '@/components/admin/form-utils'
import { MutationBusy, SubmitButton } from '@/components/mutation-ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminFieldLabel } from '@/components/admin/AdminFieldLabel'
import { EntitySelect } from '@/components/admin/EntitySelect'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { isPartFitValid, partFitFromIds, partFitIds } from '@/lib/part-fit'
import { FormFieldSkeleton } from '@/components/query-skeletons'
import {
  imageFilename,
  useCategoriesQuery,
  useDeleteSparePartImageMutation,
  useMarksQuery,
  useModelsQuery,
  useUpdateSparePartMutation,
  type SparePart,
  type SparePartWriteInput,
} from '@/queries'

export function EditPartDialog({
  part,
  open,
  onOpenChange,
}: {
  part?: SparePart
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать запчасть</DialogTitle>
        </DialogHeader>
        {open && part ? (
          <EditPartForm key={part.id} part={part} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EditPartForm({ part, onDone }: { part: SparePart; onDone: () => void }) {
  const marksQuery = useMarksQuery()
  const modelsQuery = useModelsQuery()
  const categoriesQuery = useCategoriesQuery()
  const mutation = useUpdateSparePartMutation()
  const deleteImage = useDeleteSparePartImageMutation()
  const [name, setName] = useState(part.name)
  const [article, setArticle] = useState(part.article ?? '')
  const [description, setDescription] = useState(part.description ?? '')
  const [price, setPrice] = useState(String(part.price))
  const [fit, setFit] = useState(() => partFitFromIds(part.markId, part.modelId))
  const [markId, setMarkId] = useState<number | undefined>(part.markId ?? undefined)
  const [modelId, setModelId] = useState<number | undefined>(part.modelId ?? undefined)
  const [categoryId, setCategoryId] = useState(part.categoryId)
  const [images, setImages] = useState<File[]>([])
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  const marks = marksQuery.data ?? []
  const models = modelsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const parsedPrice = Number.parseInt(price, 10)
  const { markId: nextMarkId, modelId: nextModelId } = partFitIds(fit, markId, modelId)
  const valid =
    name.trim().length > 0 &&
    Number.isInteger(parsedPrice) &&
    parsedPrice >= 1 &&
    Boolean(categoryId) &&
    isPartFitValid(fit, markId, modelId)
  const dirty =
    isTextDirty(name, part.name) ||
    isTextDirty(article, part.article) ||
    isTextDirty(description, part.description) ||
    parsedPrice !== part.price ||
    nextMarkId !== (part.markId ?? null) ||
    nextModelId !== (part.modelId ?? null) ||
    categoryId !== part.categoryId ||
    images.length > 0

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !dirty || !categoryId) {
      return
    }
    const input: SparePartWriteInput = {}
    if (isTextDirty(name, part.name)) {
      input.name = name.trim()
    }
    if (isTextDirty(article, part.article)) {
      input.article = optionalText(article) ?? null
    }
    if (isTextDirty(description, part.description)) {
      input.description = description.trim()
    }
    if (parsedPrice !== part.price) {
      input.price = parsedPrice
    }
    if (nextMarkId !== (part.markId ?? null) || nextModelId !== (part.modelId ?? null)) {
      input.markId = nextMarkId
      input.modelId = nextModelId
    }
    if (categoryId !== part.categoryId) {
      input.categoryId = categoryId
    }
    if (images.length) {
      input.images = images
    }
    mutation.mutate(
      { id: part.id, ...input },
      {
        onSuccess: () => {
          toast.success('Запчасть сохранена')
          onDone()
        },
      },
    )
  }

  return (
    <>
      <MutationBusy pending={mutation.isPending || deleteImage.isPending}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FieldGroup>
          <Field>
            <AdminFieldLabel htmlFor="edit-part-name" required>
              Название
            </AdminFieldLabel>
            <Input
              id="edit-part-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="edit-part-price" required>
              Цена, ₽
            </AdminFieldLabel>
            <Input
              id="edit-part-price"
              name="price"
              type="number"
              min={1}
              step={1}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="edit-part-article">Артикул</AdminFieldLabel>
            <Input
              id="edit-part-article"
              name="article"
              value={article}
              onChange={(event) => setArticle(event.target.value)}
            />
          </Field>
          {marksQuery.isPending || modelsQuery.isPending ? (
            <>
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </>
          ) : (
            <PartFitFields
              fit={fit}
              markId={markId}
              modelId={modelId}
              marks={marks}
              models={models}
              idPrefix="edit-part"
              onFitChange={setFit}
              onMarkChange={setMarkId}
              onModelChange={setModelId}
            />
          )}
          {categoriesQuery.isPending ? (
            <FormFieldSkeleton />
          ) : (
            <Field>
              <AdminFieldLabel htmlFor="edit-part-category" required>
                Категория
              </AdminFieldLabel>
              <EntitySelect
                id="edit-part-category"
                items={categories}
                value={categoryId}
                onChange={setCategoryId}
                onAdd={() => setCategoryModalOpen(true)}
                placeholder="Выберите категорию"
              />
            </Field>
          )}
          <Field>
            <AdminFieldLabel htmlFor="edit-part-description">Описание</AdminFieldLabel>
            <Textarea
              id="edit-part-description"
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
              existing={part.images}
              removingExisting={
                deleteImage.isPending && deleteImage.variables
                  ? part.images.find(
                      (path) => imageFilename(path) === deleteImage.variables.filename,
                    )
                  : undefined
              }
              onRemoveExisting={(path) =>
                deleteImage.mutate(
                  { id: part.id, filename: imageFilename(path) },
                  { onError: (error) => toast.error(error.message) },
                )
              }
              disabled={mutation.isPending || deleteImage.isPending}
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
      <CreateCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCreated={(category) => setCategoryId(category.id)}
      />
    </>
  )
}
