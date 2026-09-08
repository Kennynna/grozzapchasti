import 'dotenv/config'
import * as bcrypt from 'bcryptjs'
import { BCRYPT_ROUNDS } from '../auth/auth.constants'
import { assertAdminPassword } from '../config/secrets'
import { db } from './db'

async function main() {
  const login = process.env.ADMIN_LOGIN?.trim()
  const password = process.env.ADMIN_PASSWORD
  if (!login || !password) {
    throw new Error('Задайте ADMIN_LOGIN и ADMIN_PASSWORD в backend/.env')
  }
  assertAdminPassword(password)

  const runtime = await db.connect()
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const existing = await db.orm.public.Admin.where({ login }).first()
  if (existing) {
    await db.orm.public.Admin.where({ id: existing.id }).update({ passwordHash })
    console.log(`Пароль администратора «${login}» обновлён`)
  } else {
    await db.orm.public.Admin.create({ login, passwordHash })
    console.log(`Администратор «${login}» создан`)
  }
  await runtime.close()
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
