import type { ReactNode } from 'react'
import { FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

type AdminFieldLabelProps = {
  htmlFor?: string
  required?: boolean
  children: ReactNode
}

export function AdminFieldLabel({ htmlFor, required, children }: AdminFieldLabelProps) {
  return (
    <FieldLabel htmlFor={htmlFor} className="items-baseline">
      {children}
      <span
        className={cn(
          'text-xs font-normal',
          required ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {required ? 'обязательно' : 'необязательно'}
      </span>
    </FieldLabel>
  )
}
