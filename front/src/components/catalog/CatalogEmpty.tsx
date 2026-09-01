import { telegramChatHref } from '@/lib/order-message'

type CatalogEmptyProps = {
  onReset: () => void
}

export function CatalogEmpty({ onReset }: CatalogEmptyProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-10 md:px-6 md:py-14">
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground md:text-base">
        По вашему запросу ничего не найдено.{' '}
        <button
          type="button"
          className="text-primary underline-offset-4 hover:underline"
          onClick={onReset}
        >
          Сбросьте фильтры
        </button>{' '}
        или уточните у менеджера в{' '}
        <a
          href={telegramChatHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          Telegram
        </a>
        .
      </p>
    </div>
  )
}
