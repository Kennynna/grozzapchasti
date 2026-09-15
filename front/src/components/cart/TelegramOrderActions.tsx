import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { buildOrderMessage, whatsappChatHref, type OrderLine } from '@/lib/order-message'
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
  const href = whatsappChatHref()
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
        Скопируйте текст и отправьте нам в WhatsApp
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" disabled={disabled} onClick={() => void copyMessage()}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Скопировано' : 'Скопировать текст'}
        </Button>
        {disabled ? (
          <Button type="button" variant="outline" size="icon" disabled aria-label="Открыть WhatsApp">
            <WhatsAppIcon />
          </Button>
        ) : (
          <Button variant="outline" size="icon" asChild>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Открыть WhatsApp"
              title="Открыть WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
