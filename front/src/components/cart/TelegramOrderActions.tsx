import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import {
  buildOrderMessage,
  telegramChatHref,
  type OrderLine,
} from '@/lib/order-message'
import { cn } from '@/lib/utils'

type TelegramOrderActionsProps = {
  lines: OrderLine[]
  disabled?: boolean
  className?: string
}

export function TelegramOrderActions({
  lines,
  disabled = false,
  className,
}: TelegramOrderActionsProps) {
  const message = buildOrderMessage(lines)
  const href = telegramChatHref(site.telegram)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)
  }, [message])

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
      toast.error('Не удалось скопировать текст')
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-sm text-muted-foreground">
        Скопируйте текст и отправьте нам в Telegram
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" disabled={disabled} onClick={() => void copyMessage()}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Скопировано' : 'Скопировать текст'}
        </Button>
        {disabled ? (
          <Button type="button" variant="outline" size="icon" disabled aria-label="Открыть Telegram">
            <ExternalLink />
          </Button>
        ) : (
          <Button variant="outline" size="icon" asChild>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Открыть Telegram"
              title="Открыть Telegram"
            >
              <ExternalLink />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
