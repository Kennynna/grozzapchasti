import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  getApiErrorDetails,
  getApiErrorMessage,
} from '@/queries/http'
import { getQueryFlags, getQueryViewStatus } from '@/queries/status'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type QueryStatusProps<T> = {
  query: UseQueryResult<T>
  isEmpty?: (data: T) => boolean
  emptyMessage?: string
  skeleton?: ReactNode
  children: (data: T) => ReactNode
}

export function QueryStatus<T>({
  query,
  isEmpty,
  emptyMessage = 'Ничего не найдено',
  skeleton,
  children,
}: QueryStatusProps<T>) {
  const status = getQueryViewStatus(query, isEmpty)
  const { isBackgroundRefetch, isStale } = getQueryFlags(query)

  if (status === 'loading') {
    return <>{skeleton ?? <Skeleton className="h-24 w-full" />}</>
  }

  if (status === 'error') {
    const details = getApiErrorDetails(query.error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить данные</AlertTitle>
        <AlertDescription>
          <p>{getApiErrorMessage(query.error)}</p>
          {details?.length ? (
            <ul>
              {details.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            onClick={() => {
              void query.refetch()
            }}
          >
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'empty') {
    return <p className="px-4 py-2 text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div
      aria-busy={isBackgroundRefetch}
      data-refetching={isBackgroundRefetch || undefined}
      data-stale={isStale || undefined}
      className={cn(isBackgroundRefetch && 'opacity-80')}
    >
      {isBackgroundRefetch ? (
        <p className="px-4 text-xs text-muted-foreground">Обновление…</p>
      ) : null}
      {children(query.data as T)}
    </div>
  )
}
