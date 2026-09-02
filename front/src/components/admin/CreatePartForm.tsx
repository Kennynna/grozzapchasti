import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { CreateCategoryModal } from '@/components/admin/CreateCategoryForm'
import { FormError } from '@/components/admin/FormError'
import { ImageField } from '@/components/admin/ImageField'
import { PartFitFields } from '@/components/admin/PartFitFields'
import { optionalText } from '@/components/admin/form-utils'
import { AdminFieldLabel } from '@/components/admin/AdminFieldLabel'
import { EntitySelect } from '@/components/admin/EntitySelect'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { isPartFitValid, partFitIds, type PartFit } from '@/lib/part-fit'
import { MutationBusy, SubmitButton } from '@/components/mutation-ui'
import { FormFieldSkeleton } from '@/components/query-skeletons'
import {
  getApiErrorMessage,
  useCategoriesQuery,
  useCreateSparePartMutation,
  useMarksQuery,
  useModelsQuery,
} from '@/queries'

const emptyPartForm = {
  name: '',
  article: '',
  description: '',
  price: '',
  fit: 'auto' as PartFit,
  markId: undefined as number | undefined,
  modelId: undefined as number | undefined,
  categoryId: undefined as number | undefined,
  images: [] as File[],
}

export function CreatePartForm() {
  const marksQuery = useMarksQuery()
  const modelsQuery = useModelsQuery()
  const categoriesQuery = useCategoriesQuery()
  const mutation = useCreateSparePartMutation()
  const [name, setName] = useState(emptyPartForm.name)
  const [article, setArticle] = useState(emptyPartForm.article)
  const [description, setDescription] = useState(emptyPartForm.description)
  const [price, setPrice] = useState(emptyPartForm.price)
  const [fit, setFit] = useState<PartFit>(emptyPartForm.fit)
  const [markId, setMarkId] = useState<number | undefined>(emptyPartForm.markId)
  const [modelId, setModelId] = useState<number | undefined>(emptyPartForm.modelId)
  const [categoryId, setCategoryId] = useState<number | undefined>(emptyPartForm.categoryId)
  const [images, setImages] = useState<File[]>(emptyPartForm.images)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  const marks = marksQuery.data ?? []
  const models = modelsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const parsedPrice = Number.parseInt(price, 10)
  const valid =
    name.trim().length > 0 &&
    Number.isInteger(parsedPrice) &&
    parsedPrice >= 1 &&
    Boolean(categoryId) &&
    isPartFitValid(fit, markId, modelId)

  function resetForm() {
    setName(emptyPartForm.name)
    setArticle(emptyPartForm.article)
    setDescription(emptyPartForm.description)
    setPrice(emptyPartForm.price)
    setFit(emptyPartForm.fit)
    setMarkId(emptyPartForm.markId)
    setModelId(emptyPartForm.modelId)
    setCategoryId(emptyPartForm.categoryId)
    setImages(emptyPartForm.images)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !categoryId) {
      return
    }
    const { markId: nextMarkId, modelId: nextModelId } = partFitIds(fit, markId, modelId)
    mutation.mutate(
      {
        name: name.trim(),
        price: parsedPrice,
        markId: nextMarkId,
        modelId: nextModelId,
        categoryId,
        article: optionalText(article),
        description: optionalText(description),
        images: images.length ? images : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Запчасть успешно добавлена')
          mutation.reset()
          resetForm()
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error))
        },
      },
    )
  }

  return (
    <>
      <MutationBusy pending={mutation.isPending}>
        <form onSubmit={onSubmit} className="space-y-6">
        <FieldGroup>
          <Field>
            <AdminFieldLabel htmlFor="part-name" required>
              Название
            </AdminFieldLabel>
            <Input
              id="part-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <AdminFieldLabel htmlFor="part-price" required>
              Цена, ₽
            </AdminFieldLabel>
            <Input
              id="part-price"
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
            <AdminFieldLabel htmlFor="part-article">Артикул</AdminFieldLabel>
            <Input
              id="part-article"
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
              idPrefix="part"
              onFitChange={setFit}
              onMarkChange={setMarkId}
              onModelChange={setModelId}
            />
          )}
          {categoriesQuery.isPending ? (
            <FormFieldSkeleton />
          ) : (
            <Field>
              <AdminFieldLabel htmlFor="part-category" required>
                Категория
              </AdminFieldLabel>
              <EntitySelect
                id="part-category"
                items={categories}
                value={categoryId}
                onChange={setCategoryId}
                onAdd={() => setCategoryModalOpen(true)}
                placeholder="Выберите категорию"
              />
            </Field>
          )}
          <Field>
            <AdminFieldLabel htmlFor="part-description">Описание</AdminFieldLabel>
            <Textarea
              id="part-description"
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
      <CreateCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCreated={(category) => setCategoryId(category.id)}
      />
    </>
  )
}
