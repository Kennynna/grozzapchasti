# План grozzapchasti

Живой документ. Обновлять по мере работы, чтобы в следующей сессии не собирать контекст заново.

## Что это

Каталог автозапчастей: публичный витринный сайт + закрытая админка (один админ, без регистрации пользователей).

- **Фронт:** `front/` — Vite + React 19. Витрина на API (`front/src/queries/`), моков нет.
- **Бэк:** `backend/` — NestJS 11 + Prisma Next (PostgreSQL). CRUD, JWT, фото на диске.

## Решения (не пересматривать без причины)

1. **Фото на диске**, не в БД и не во внешнем CDN. В БД храним пути вида `/uploads/marks/<uuid>.jpg`. Раздача: `GET /uploads/...`.
2. **До 3 фото** у марки, модели и запчасти. Лимит на бэке (multer + сервис). Категории без фото.
3. **Удаление фото отдельно** от удаления сущности: `DELETE /api/<entity>/:id/images/:filename`. При удалении марки/модели/запчасти файлы с диска тоже стираются.
4. **Категории** — отдельная сущность. У запчасти обязательна `categoryId`. `markId` / `modelId` опциональны: конкретное авто, вся марка (`markId` + `modelId` null) или все автомобили (оба null). Если модель задана — марка обязательна и модель должна ей принадлежать.
5. **Авторизация:** один админ в таблице `Admin`, пароль через bcrypt, доступ по JWT (`Authorization: Bearer`). GET витрины публичный. POST/PATCH/DELETE только с валидным токеном. С фронта «спрятать кнопки» недостаточно — бэк обязан отклонять запросы без JWT.
6. **Глобальный префикс API:** `/api`. Статика `/uploads` без префикса.
7. **Фильтрация каталога — на фронте.** Бэк отдаёт списки целиком (`GET /api/marks`, `/models`, `/categories`, `/spare-parts`). Витрина сама сужает выдачу. Не дергать бэк на каждый клик по категории или ползунку цены. Query-параметры на `GET /api/spare-parts` для витрины не используем.
8. **UI: shadcn/ui** (Radix + Nova, Tailwind v4). Компоненты лежат в `front/src/components/ui/`. Новые UI-элементы брать оттуда (`pnpm dlx shadcn@latest add <name>`), не ставить другую библиотеку.
9. **Роутер: TanStack Router**, не React Router. Корзина и избранное — zustand persist (`localStorage`). JWT админа — `sessionStorage`.
10. **Тема витрины** — `front/design.md` (тёмный графит + бронза, шрифт Manrope). Светлую тему не делаем.
11. **Покупателей, заказов и оплаты нет.** Корзина не уходит на бэк. «Оформить» — скопировать текст заказа и открыть `t.me/<username>` в новой вкладке. Подробности — `front/FRONT.md` § «Оформить → Telegram».

## Модель данных

```
Admin        login + passwordHash
Category     name (unique), description
Mark         name (unique), description, images[]
Model        name, description, images[], markId
             unique (name, markId)
SparePart    name, article? (unique если задан), description, images[], markId?, modelId?, categoryId, price
```

Каскад: удаление марки → модели и запчасти этой марки (универсальные с `markId` null остаются). Удаление категории с запчастями — запрещено (Restrict).

Универсальные и «на всю марку» на витрине не попадают в основную сетку выбранной модели — только в блок «Возможно, вам понадобится».

**Цена:** `SparePart.price` — целое число (рубли), обязательна при создании, минимум 1. В сидах: 890 / 1200 / 4500 / 8900, чтобы диапазон на витрине было на чем проверить.

## Статус

### Сделано в коде и локально

- [x] Файл плана (`PLAN.md`)
- [x] Схема: `images[] @default([])`, Category, markId у запчасти, Admin; `SparePart.markId`/`modelId` nullable
- [x] JWT-логин, гард на мутации
- [x] Загрузка фото на диск, лимит 3, удаление файла
- [x] CRUD марок / моделей / категорий / запчастей
- [x] `SparePart.article` опциональный unique
- [x] Сиды категорий и сущностей без картинок-заглушек URL
- [x] Vite proxy `/api` и `/uploads` → бэкенд `:4060`
- [x] Схема применена к Postgres (`prisma db update`), сиды залиты, бэк запущен на `:4060`
- [x] Единый формат ошибок API, валидация полей, фото до 10 МБ

Для смены схемы в следующий раз: `npm run contract:emit` → `npx prisma db update` (не `db init`: он только добавляет колонки).

### Дальше (фронт)

План по шагам, роуты, поля форм, тема: [`front/FRONT.md`](front/FRONT.md). Не дублировать чеклист здесь — идти по шагам там.

- [x] Добавить `price` в `SparePart`
- [x] JWT на фронте (`sessionStorage`), хуки в `front/src/queries/`
- [x] shadcn/ui + zustand (корзина/избранное)
- [x] Витрина + админ UI по `FRONT.md` (шаги 1–9)
- [x] Оптимизация витрины, страница товара, поиск, шаринг фильтров — шаги 10–14 в `FRONT.md`
- [x] Применимость запчасти (эта модель / марка / все авто) — шаг 15
- [x] Доводка витрины — шаг 16 в `FRONT.md`

## API для фронта

Актуально и кратко: [`front/BACKEND.md`](front/BACKEND.md) — ручки, JWT, фото, формат ошибок.  
План UI: [`front/FRONT.md`](front/FRONT.md). Агент на фронте читает **FRONT.md**, потом BACKEND.md.

## Файлы, которые трогаем чаще всего

- Схема: `backend/src/prisma/contract.prisma`
- Клиент БД: `backend/src/prisma/db.ts`
- После правки схемы: `npx prisma contract emit` затем `npx prisma db init`
- Сиды: `backend/src/prisma/seed.ts` → `npm run db:seed`
- Загрузки: `backend/src/uploads/`
- Auth: `backend/src/auth/`
- Каталог: `backend/src/marks|models|categories|spare-parts/`
- Фото на диске: `backend/uploads/` (в git не коммитим)
- Фронт-план: `front/FRONT.md`
- Тема: `front/design.md`
- Сторы корзины/избранного: `front/src/stores/`

## Env (backend/.env)

```
DATABASE_URL=postgresql://zapchasti:zapzhasti123@localhost:5432/grozzapchastiDB
JWT_SECRET=...
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin
FRONTEND_ORIGIN=http://localhost:5173
PORT=4060
```

Локальный пароль `admin` только для разработки. Перед продом сменить `JWT_SECRET` и пароль.

Админ сидится при старте бэка, если таблица пустая. Смена `ADMIN_PASSWORD` в env существующий хеш сама не обновит.

## Как гонять локально

```bash
# postgres
cd backend && docker compose up -d

# схема и сиды (если ещё не)
npx prisma contract emit
npx prisma db init
npm run db:seed

# бэк
npm run start:dev   # :4060

# фронт
cd front && pnpm dev   # :5173
```

## Заметки на потом

- Шаги 1–15 в `front/FRONT.md` закрыты. Следующий шаг — первый `[ ]` там (сейчас пусто).
- Бэк: нет заказов. Категория независимая (только name/description, без фото). Артикул у запчасти опциональный.
- Фильтры витрины не ходят на бэк: один раз загрузили списки, дальше `filter` в памяти (`front/src/lib/format.ts` + URL `/` + стор `catalog.ts`).
- CORS разрешён для `FRONTEND_ORIGIN`.
- Имена файлов — uuid + расширение, путь не принимает `..`.
- Допустимые типы: jpeg, png, webp, gif. Максимум 10 МБ на файл, не больше 3 штук.
- Ошибки API: `{ statusCode, message, details? }`. Пустые обязательные поля → `Не все поля заполнены`. Слишком большое фото → `Изображение слишком большое. Максимум 10 МБ`. Сбой записи в БД → `Не удалось создать/обновить марку|модель|категорию|запчасть`. Известные ошибки (дубликат, не найдено, файл) остаются как есть.
- Prisma Next: `where` обязателен перед `update`/`delete`. `deleteAll` тоже только с фильтром.
- Один git на весь проект (`front/` + `backend/`). Не заводить `.git` внутри пакетов.
