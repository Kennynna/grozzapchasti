const WEAK_PASSWORDS = new Set([
  'admin',
  'admin123',
  'password',
  'password1',
  'password123',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'letmein',
  'welcome',
  'change-me',
  'changeme',
])

const WEAK_JWT = new Set([
  'change-me-to-a-long-random-secret',
  'secret',
  'jwt',
  'jwt-secret',
])

export function isWeakPassword(password: string): boolean {
  const trimmed = password.trim()
  if (trimmed.length < 10) {
    return true
  }
  if (/придумайте|change-me|placeholder|replace-with/i.test(trimmed)) {
    return true
  }
  return WEAK_PASSWORDS.has(trimmed.toLowerCase())
}

export function assertAdminPassword(password: string): void {
  if (isWeakPassword(password)) {
    throw new Error(
      'ADMIN_PASSWORD слишком простой (короткий или из известных утечек вроде admin). Chrome из‑за этого показывает «пароль найден в утечке». Придумайте свой, не короче 10 символов.',
    )
  }
}

export function assertRuntimeEnv(): void {
  const jwt = process.env.JWT_SECRET?.trim()
  if (!jwt || jwt.length < 32) {
    throw new Error('JWT_SECRET должен быть не короче 32 символов')
  }

  if (process.env.NODE_ENV !== 'production') {
    return
  }

  if (
    WEAK_JWT.has(jwt) ||
    /change-me|вставьте|placeholder/i.test(jwt)
  ) {
    throw new Error('На проде нельзя оставлять шаблонный JWT_SECRET')
  }

  const origin = process.env.FRONTEND_ORIGIN?.trim()
  if (!origin?.startsWith('https://') || origin.endsWith('/')) {
    throw new Error(
      'На проде FRONTEND_ORIGIN должен быть https://ваш-домен без слэша в конце',
    )
  }

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL не задан')
  }
}
