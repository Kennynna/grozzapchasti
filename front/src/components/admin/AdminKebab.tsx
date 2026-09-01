import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type AdminKebabProps = {
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
  className?: string
}

export function AdminKebab({ isAdmin, onEdit, onDelete, className }: AdminKebabProps) {
  if (!isAdmin) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Действия"
          className={cn('bg-background/80 backdrop-blur-sm', className)}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-40"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem onSelect={onEdit}>Редактировать</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
