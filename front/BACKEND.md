# API бэкенда для фронта

База: `http://localhost:4060`. С Vite-прокси в dev ходить на те же пути с фронта: `/api/...` и `/uploads/...`.

Константа: `API_URL = '/api'` в `front/src/config/constants.ts`.

Фильтры витрины (марка, модель, категория, цена) считаются **на клиенте**. Бэк отдаёт полные списки.

---

## Авторизация

Один админ, пользователей нет.

Локально: `admin` / `admin`.

```
POST /api/auth/login
{ "login": "admin", "password": "admin" }

→ { "accessToken": "<jwt>", "admin": { "id": 1, "login": "admin" } }
```

Все `POST` / `PATCH` / `DELETE` (кроме логина):

```
Authorization: Bearer <accessToken>
```

Без токена → `401` `"Нужна авторизация администратора"`.  
Протухший токен → `401` `"Сессия недействительна"`.

`GET /api/auth/me` — тоже с токеном → `{ id, login }`.

Витринные `GET` без токена.

---

## Ошибки

Всегда JSON:

```json
{
  "statusCode": 400,
  "message": "Не все поля заполнены",
  "details": ["Название обязательно"]
}
```

`details` есть не всегда. На фронте показывать `message`; если есть `details` — можно списком под ним.

| status | когда | message (типично) |
|---|---|---|
| 400 | пустые обязательные поля | `Не все поля заполнены` + `details` |
| 400 | лишнее поле / неверный тип | `Ошибка валидации` |
| 400 | id не число | `Некорректный id` |
| 400 | фото > 10 МБ | `Изображение слишком большое. Максимум 10 МБ` |
| 400 | не jpeg/png/webp/gif | `Можно загружать только jpeg, png, webp или gif` |
| 400 | больше 3 фото | `Можно загрузить не больше 3 фотографий` |
| 400 | модель не от этой марки | `Модель не принадлежит выбранной марке` |
| 401 | нет/битый JWT | см. выше |
| 404 | нет записи | `Марка не найдена` / `Модель не найдена` / `Категория не найдена` / `Запчасть не найдена` |
| 409 | имя занято | `Марка с таким названием уже есть` (аналогично модель/категория) |
| 409 | удалить категорию с запчастями | `Нельзя удалить категорию, пока к ней привязаны запчасти` |
| 500 | сбой записи | `Не удалось создать марку` / `Не удалось обновить марку` (то же для модели, категории, запчасти) |
| 500 | прочее | `Внутренняя ошибка сервера` |

---

## Фото

Поле формы: `images` (можно несколько файлов).  
Максимум **3** на сущность, **10 МБ** каждое. Типы: jpeg, png, webp, gif.  
Категории без фото.

В сущности: `images: string[]` — пути вида `/uploads/marks/<uuid>.jpg`.  
Показ: `src={path}` (прокси) или `http://localhost:4060${path}`.

Удаление одного файла: `DELETE /api/<entity>/:id/images/:filename`  
`filename` — только имя, например `a1b2c3....jpg` (из конца пути).

Создание/обновление с фото — `multipart/form-data`. Без фото можно `application/json` или multipart только с текстовыми полями.  
PATCH с новыми `images` **добавляет** к уже существующим, пока сумма ≤ 3. Чтобы заменить — сначала DELETE фото, потом PATCH.

---

## Сущности (ответ GET)

```ts
Mark      { id, name, description: string | null, images: string[], createdAt, updatedAt }
Model     { id, name, description, images, markId, createdAt, updatedAt }
Category  { id, name, description, createdAt, updatedAt }
SparePart { id, name, description, images, price, markId, modelId, categoryId, createdAt, updatedAt }
```

`price` — целые рубли, ≥ 1.

---

## Ручки

`публично` = без JWT. Остальное — админ.

### Auth

| | | |
|---|---|---|
| POST | `/api/auth/login` | публично. body: `login`, `password` |
| GET | `/api/auth/me` | админ |

### Marks

| | | |
|---|---|---|
| GET | `/api/marks` | публично |
| GET | `/api/marks/:id` | публично |
| POST | `/api/marks` | `name` обяз., `description?`, `images?` |
| PATCH | `/api/marks/:id` | любые из тех же полей |
| DELETE | `/api/marks/:id` | каскад: модели и запчасти + их фото с диска |
| DELETE | `/api/marks/:id/images/:filename` | одно фото |

### Models

| | | |
|---|---|---|
| GET | `/api/models` | публично. опционально `?markId=` |
| GET | `/api/models/:id` | публично |
| POST | `/api/models` | `name`, `markId` обяз., `description?`, `images?` |
| PATCH | `/api/models/:id` | любые из тех же полей |
| DELETE | `/api/models/:id` | каскад: запчасти |
| DELETE | `/api/models/:id/images/:filename` | |

### Categories

| | | |
|---|---|---|
| GET | `/api/categories` | публично |
| GET | `/api/categories/:id` | публично |
| POST | `/api/categories` | `name` обяз., `description?` |
| PATCH | `/api/categories/:id` | |
| DELETE | `/api/categories/:id` | нельзя, если есть запчасти (409) |

### Spare parts (запчасти / товар)

| | | |
|---|---|---|
| GET | `/api/spare-parts` | публично. для витрины грузить без query |
| GET | `/api/spare-parts/:id` | публично |
| POST | `/api/spare-parts` | `name`, `price`, `markId`, `modelId`, `categoryId` обяз. `description?`, `images?`. `modelId` должен быть от `markId` |
| PATCH | `/api/spare-parts/:id` | любые из тех же полей |
| DELETE | `/api/spare-parts/:id` | |
| DELETE | `/api/spare-parts/:id/images/:filename` | |

Query у списка (`?markId=&modelId=&categoryId=`) на бэке есть, витрине не нужны.

---

## Примеры

Логин:

```http
POST /api/auth/login
Content-Type: application/json

{"login":"admin","password":"admin"}
```

Создать запчасть с фото:

```http
POST /api/spare-parts
Authorization: Bearer <token>
Content-Type: multipart/form-data

name=Масляный фильтр
price=890
markId=1
modelId=1
categoryId=3
description=опционально
images=<file>
images=<file>
```

Пустой POST марки без `name`:

```json
{ "statusCode": 400, "message": "Не все поля заполнены", "details": ["Название обязательно"] }
```

---

Бэк должен быть запущен: `cd backend && npm run start:dev` (порт 4060). Подробный план проекта: `../PLAN.md`.
