import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { Check, Copy, Heart, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AdminKebab } from '@/components/admin/AdminKebab'
import {
  ConfirmDeleteDialog,
  EditPartDialog,
} from '@/components/admin/lazy-dialogs'
import { TelegramOrderActions } from '@/components/cart/TelegramOrderActions'
import { ImageGallery } from '@/components/catalog/ImageGallery'
import { SparePartCard } from '@/components/catalog/SparePartCard'
import { QueryStatus } from '@/components/QueryStatus'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { site } from '@/config/site'
import { formatPrice, relatedPartsFor } from '@/lib/format'
import { partFitLabel } from '@/lib/part-fit'
import { cn } from '@/lib/utils'
import {
  ApiError,
  marksQueries,
  modelsQueries,
  queryClient,
  sparePartsQueries,
  useCategoriesQuery,
  useDeleteSparePartMutation,
  useIsAdmin,
  useMarksQuery,
  useModelsQuery,
  useSparePartQuery,
  useSparePartsQuery,
  type Mark,
  type Model,
  type SparePart,
} from '@/queries'
import { selectCartQuantity, useCartStore, useFavoritesStore } from '@/stores'

export const Route = createFileRoute('/parts/$partId')({
  params: {
    parse: (params) => {
      const partId = Number(params.partId)
      if (!Number.isInteger(partId) || partId < 1) {
        throw notFound()
      }
      return { partId }
    },
    stringify: ({ partId }) => ({ partId: String(partId) }),
  },
  loader: async ({ params }) => {
    try {
      const [part] = await Promise.all([
        queryClient.ensureQueryData(sparePartsQueries.detail(params.partId)),
        queryClient.ensureQueryData(sparePartsQueries.list()),
        queryClient.ensureQueryData(marksQueries.list()),
        queryClient.ensureQueryData(modelsQueries.list()),
      ])
      return part
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        throw notFound()
      }
      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? 'Запчасть'} · ${site.name}` },
      {
        name: 'description',
        content: loaderData?.description || site.description,
      },
    ],
  }),
  component: PartPage,
})

function PartPage() {
  const { partId } = Route.useParams()
  const navigate = useNavigate()
  const partQuery = useSparePartQuery(partId)
  const partsQuery = useSparePartsQuery()
  const marksQuery = useMarksQuery()
  const modelsQuery = useModelsQuery()
  const categoriesQuery = useCategoriesQuery()
  const isAdmin = useIsAdmin()
  const deleteMutation = useDeleteSparePartMutation()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const favorite = useFavoritesStore((state) => state.ids.includes(partId))
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const addToCart = useCartStore((state) => state.add)
  const cartQuantity = useCartStore(selectCartQuantity(partId))
  const related = useMemo(() => {
    if (!partQuery.data || !partsQuery.data) {
      return []
    }
    return relatedPartsFor(partQuery.data, partsQuery.data)
  }, [partQuery.data, partsQuery.data])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <QueryStatus
        query={partQuery}
        skeleton={<Skeleton className="aspect-[4/3] max-w-xl rounded-lg" />}
      >
        {(part) => {
          const mark = marksQuery.data?.find((item) => item.id === part.markId)
          const model = modelsQuery.data?.find((item) => item.id === part.modelId)
          const category = categoriesQuery.data?.find((item) => item.id === part.categoryId)
          return (
            <>
              <PartView
                part={part}
                markName={mark?.name}
                modelName={model?.name}
                categoryName={category?.name}
                isAdmin={isAdmin}
                favorite={favorite}
                cartQuantity={cartQuantity}
                onFavorite={() => toggleFavorite(part.id)}
                onAddToCart={() => {
                  addToCart(part.id)
                  toast.success(
                    cartQuantity > 0 ? 'Ещё одна в корзине' : 'Добавлено в корзину',
                  )
                }}
                onEdit={() => setEditOpen(true)}
                onDelete={() => {
                  deleteMutation.reset()
                  setDeleteOpen(true)
                }}
              />
              {related.length > 0 ? (
                <RelatedParts
                  parts={related}
                  marks={marksQuery.data ?? []}
                  models={modelsQuery.data ?? []}
                />
              ) : null}
            </>
          )
        }}
      </QueryStatus>
      <EditPartDialog
        part={partQuery.data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Удалить запчасть?"
        description="Запчасть исчезнет из каталога, корзины и избранного."
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onConfirm={() => {
          deleteMutation.mutate(partId, {
            onSuccess: () => {
              toast.success('Запчасть удалена')
              setDeleteOpen(false)
              void navigate({ to: '/' })
            },
          })
        }}
      />
    </div>
  )
}

function PartView({
  part,
  markName,
  modelName,
  categoryName,
  isAdmin,
  favorite,
  cartQuantity,
  onFavorite,
  onAddToCart,
  onEdit,
  onDelete,
}: {
  part: SparePart
  markName?: string
  modelName?: string
  categoryName?: string
  isAdmin: boolean
  favorite: boolean
  cartQuantity: number
  onFavorite: () => void
  onAddToCart: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const inCart = cartQuantity > 0

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <ImageGallery images={part.images} alt={part.name} />
      <div className="relative flex flex-col gap-4">
        <AdminKebab
          isAdmin={isAdmin}
          className="absolute top-0 right-0"
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <PartBreadcrumb
          part={part}
          markName={markName}
          modelName={modelName}
        />
        <h1 className="text-3xl md:text-4xl">{part.name}</h1>
        {categoryName ? (
          <p className="text-sm text-muted-foreground">{categoryName}</p>
        ) : null}
        {part.article ? (
          <button
            type="button"
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              void navigator.clipboard.writeText(part.article ?? '').then(
                () => toast.success('Артикул скопирован'),
                () => toast.error('Не удалось скопировать'),
              )
            }}
          >
            <span>арт. {part.article}</span>
            <Copy className="size-3.5" />
          </button>
        ) : null}
        <p className="text-3xl font-medium text-primary">{formatPrice(part.price)}</p>
        {part.description ? (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {part.description}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={onAddToCart}>
            {inCart ? <Check /> : <Plus />}
            {inCart ? `Ещё в корзину (${cartQuantity})` : 'В корзину'}
          </Button>
          <Button type="button" variant="outline" onClick={onFavorite}>
            <Heart className={cn(favorite && 'fill-primary text-primary')} />
            {favorite ? 'В избранном' : 'В избранное'}
          </Button>
        </div>
        <TelegramOrderActions
          className="mt-2"
          lines={[
            {
              name: part.name,
              article: part.article,
              quantity: 1,
              price: part.price,
            },
          ]}
        />
      </div>
    </div>
  )
}

function PartBreadcrumb({
  part,
  markName,
  modelName,
}: {
  part: SparePart
  markName?: string
  modelName?: string
}) {
  const crumbClass = 'hover:text-foreground'

  return (
    <p className="text-sm text-muted-foreground">
      <Link to="/" hash="catalog" className={crumbClass}>
        Каталог
      </Link>
      {part.markId ? (
        <>
          <span className="px-2">/</span>
          <Link
            to="/"
            search={{ markId: part.markId }}
            hash="catalog"
            className={crumbClass}
          >
            {markName ?? 'Марка'}
          </Link>
          {part.modelId ? (
            <>
              <span className="px-2">/</span>
              <Link
                to="/"
                search={{ markId: part.markId, modelId: part.modelId }}
                hash="catalog"
                className={crumbClass}
              >
                {modelName ?? 'Модель'}
              </Link>
            </>
          ) : (
            <>
              <span className="px-2">/</span>
              <span>все модели</span>
            </>
          )}
        </>
      ) : (
        <>
          <span className="px-2">/</span>
          <span>Для всех авто</span>
        </>
      )}
    </p>
  )
}

function RelatedParts({
  parts,
  marks,
  models,
}: {
  parts: SparePart[]
  marks: Mark[]
  models: Model[]
}) {
  const marksById = new Map(marks.map((mark) => [mark.id, mark.name]))
  const modelsById = new Map(models.map((model) => [model.id, model.name]))

  return (
    <section className="mt-16 space-y-4 border-t border-border pt-10">
      <h2 className="text-lg font-semibold">Возможно, вам понадобится</h2>
      <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
        {parts.map((part) => (
          <SparePartCard
            key={part.id}
            part={part}
            markName={partFitLabel(
              part,
              part.markId ? marksById.get(part.markId) : undefined,
              part.modelId ? modelsById.get(part.modelId) : undefined,
            )}
          />
        ))}
      </div>
    </section>
  )
}
