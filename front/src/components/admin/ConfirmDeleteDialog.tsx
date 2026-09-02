import { FormError } from '@/components/admin/FormError'
import { MutationBusy, SubmitButton } from '@/components/mutation-ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConfirmDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  pending?: boolean
  error?: unknown
  onConfirm: () => void
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  error,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending && !next) {
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <MutationBusy pending={Boolean(pending)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {error ? <FormError error={error} title="Не удалось удалить" /> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <SubmitButton
              type="button"
              variant="destructive"
              pending={pending}
              pendingLabel="Удаляем"
              onClick={onConfirm}
            >
              Удалить
            </SubmitButton>
          </DialogFooter>
        </MutationBusy>
      </DialogContent>
    </Dialog>
  )
}
