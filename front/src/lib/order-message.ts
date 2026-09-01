// Текст заказа для Telegram. Оплаты нет. См. FRONT.md § «Оформить → Telegram»
import { site } from '@/config/site'
import { formatPrice } from './format'

export type OrderLine = {
  name: string
  article: string | null
  quantity: number
  price: number
}

export function orderTotal(lines: OrderLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

function telegramUsername(raw: string) {
  return raw.replace(/^@/, '')
}

function formatOrderLine(index: number, line: OrderLine) {
  const article = line.article ? ` — арт. ${line.article}` : ''
  return `${index}. ${line.name}${article} — ${line.quantity} шт. × ${formatPrice(line.price)}`
}

export function buildOrderMessage(
  lines: OrderLine[],
  options: { intro?: string } = {},
) {
  const intro = options.intro ?? site.orderMessageIntro
  const rows = lines.map((line, index) => formatOrderLine(index + 1, line))
  return [intro, '', ...rows].join('\n')
}

export function telegramChatHref(username: string = site.telegram) {
  return `https://t.me/${telegramUsername(username)}`
}
