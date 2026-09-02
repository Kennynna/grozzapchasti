import { Loader2 } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden />
}

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pending?: boolean
  pendingLabel: ReactNode
}

export function SubmitButton({
  pending = false,
  pendingLabel,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? <Spinner /> : null}
      {pending ? pendingLabel : children}
    </Button>
  )
}

export function MutationBusy({
  pending,
  className,
  children,
}: {
  pending: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('relative', className)} aria-busy={pending}>
      <div className={pending ? 'pointer-events-none select-none' : undefined}>{children}</div>
      {pending ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/55">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : null}
    </div>
  )
}
