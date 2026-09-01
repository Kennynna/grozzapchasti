import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getApiErrorDetails, getApiErrorMessage } from '@/queries'

export function FormError({
  error,
  title = 'Не удалось сохранить',
}: {
  error: unknown
  title?: string
}) {
  if (!error) {
    return null
  }

  const details = getApiErrorDetails(error)

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{getApiErrorMessage(error)}</p>
        {details?.length ? (
          <ul>
            {details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
