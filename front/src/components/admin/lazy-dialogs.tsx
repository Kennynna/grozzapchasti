import { lazy, Suspense, type ComponentProps } from 'react'

const EditMarkDialogInner = lazy(() =>
  import('./EditMarkDialog').then((module) => ({ default: module.EditMarkDialog })),
)
const EditModelDialogInner = lazy(() =>
  import('./EditModelDialog').then((module) => ({ default: module.EditModelDialog })),
)
const EditCategoryDialogInner = lazy(() =>
  import('./EditCategoryDialog').then((module) => ({ default: module.EditCategoryDialog })),
)
const EditPartDialogInner = lazy(() =>
  import('./EditPartDialog').then((module) => ({ default: module.EditPartDialog })),
)
const ConfirmDeleteDialogInner = lazy(() =>
  import('./ConfirmDeleteDialog').then((module) => ({ default: module.ConfirmDeleteDialog })),
)

export function EditMarkDialog(props: ComponentProps<typeof EditMarkDialogInner>) {
  if (!props.open) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <EditMarkDialogInner {...props} />
    </Suspense>
  )
}

export function EditModelDialog(props: ComponentProps<typeof EditModelDialogInner>) {
  if (!props.open) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <EditModelDialogInner {...props} />
    </Suspense>
  )
}

export function EditCategoryDialog(props: ComponentProps<typeof EditCategoryDialogInner>) {
  if (!props.open) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <EditCategoryDialogInner {...props} />
    </Suspense>
  )
}

export function EditPartDialog(props: ComponentProps<typeof EditPartDialogInner>) {
  if (!props.open) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <EditPartDialogInner {...props} />
    </Suspense>
  )
}

export function ConfirmDeleteDialog(props: ComponentProps<typeof ConfirmDeleteDialogInner>) {
  if (!props.open) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <ConfirmDeleteDialogInner {...props} />
    </Suspense>
  )
}
