import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ADD_OPTION_VALUE = '__add__'

type EntitySelectProps = {
  id?: string
  items: { id: number; name: string }[]
  value?: number
  onChange: (id: number) => void
  onAdd?: () => void
  placeholder: string
  disabled?: boolean
}

export function EntitySelect({
  id,
  items,
  value,
  onChange,
  onAdd,
  placeholder,
  disabled,
}: EntitySelectProps) {
  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(next) => {
        if (next === ADD_OPTION_VALUE) {
          onAdd?.()
          return
        }
        onChange(Number(next))
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        {onAdd ? (
          <>
            <SelectItem value={ADD_OPTION_VALUE}>Добавить…</SelectItem>
            <SelectSeparator />
          </>
        ) : null}
        {items.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
