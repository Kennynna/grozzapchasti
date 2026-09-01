# План фронта grozzapchasti

Живой документ. Читать **перед** правками UI. API — [`BACKEND.md`](./BACKEND.md). Тема — [`design.md`](./design.md). Общий план — [`../PLAN.md`](../PLAN.md).

## Как отмечать сделанное

Другой агент читает этот блок **первым**. Сделанное не переписываем с нуля и не ищем «на глаз» по репо.

- В «Уже в коде» и в «Шаги»: `[x]` = готово, `[ ]` = нет.
- Под каждым `[x]` сразу **файлы и как**: путь + одна строка, что именно там. Без этого отметка не считается понятной.
- Не снимать `[x]` без причины. Правка по уже закрытому шагу — **дописать** строку в тот же блок.
- Не дублировать этот чеклист в `PLAN.md`. Текущий шаг — первый `[ ]` в «Шаги».

## Уже в коде (не переделывать)

Фундамент до шагов UI. Шаги 1–9 его используют, а не заменяют.

- [x] API-слой (TanStack Query, не zustand)
  - `src/queries/` — серверное состояние. Новые ручки только сюда. Карта экспорта: `src/queries/index.ts`
  - Ключи доменные: `marksKeys` / `modelsKeys` / `categoriesKeys` / `sparePartsKeys` / `authKeys`
  - queryFn рядом с хуками в том же файле (`marks.ts`, `models.ts`, …)
  - update / delete / удаление фото — optimistic + rollback; create — `invalidateQueries` списков
  - UI-состояния: `src/queries/status.ts` + `src/components/QueryStatus.tsx` (loading, error, empty, background-refetch, stale)
  - `src/queries/http.ts` — fetch, JWT, `ApiError` из `{ statusCode, message, details? }`
  - `src/queries/auth-token.ts` — JWT в `sessionStorage`; 401 и `logout()` сбрасывают кэш `auth`
- [x] Корзина и избранное (сторы)
  - `src/stores/cart.ts` — zustand persist, ключ `grozzapchasti.cart`
  - `src/stores/favorites.ts` — zustand persist, ключ `grozzapchasti.favorites`
  - `src/stores/catalog.ts` — выбранные марка / модель / категория, ключ `grozzapchasti.catalog`
- [x] shadcn/ui
  - `src/components/ui/` — не трогать без нужды. Новые примитивы: `pnpm dlx shadcn@latest add <name>`
- [x] Контакты и копирайт
  - `src/config/site.ts` — статика витрины, не с бэка
- [x] Моки выкинуты
  - `src/config/constants.ts` — только `API_URL`

## Что строим

Публичная витрина премиум-запчастей + скрытый админ. Пользователей нет: корзина и избранное только в `localStorage`. Заказов и оплаты нет — «Оформить» собирает текст заказа и открывает Telegram.

## Решения (не пересматривать без причины)

1. **Роутер: TanStack Router** (file-based). Уже есть TanStack Query — тот же стек, типизированные URL и search-params для фильтров каталога. Не React Router.
2. **Корзина / избранное: zustand + persist.** Сторы: `src/stores/cart.ts`, `src/stores/favorites.ts`. JWT админа — `sessionStorage` (`queries/auth-token.ts`), не localStorage.
3. **Тема: тёмная всегда.** Палитра и Manrope — `design.md`. Не светлая тема, не `prefers-color-scheme`.
4. **Фильтры каталога на клиенте.** На `/` источник правды — search-params: `markId`, `modelId`, `categoryId`, `page`. Persist (`src/stores/catalog.ts`) хранит марку / модель / категорию, чтобы вернуться с `/cart` без query. Пустой URL после гидрации один раз заполняется из стора. Смена марки сбрасывает модель. Смена фильтров сбрасывает `page`. Поиска по тексту и фильтра по цене нет. Сетка запчастей — по 14 на страницу.
5. **Админские кнопки только UI.** Мутации всё равно с JWT; без токена бэк ответит 401.
6. **Моки в `config/constants.ts` удалить**, данные только с API (`src/queries/`).
7. **Артикул на карточке** — `SparePart.article: string | null`. При создании необязателен. Если есть — показываем, если `null` — блок артикула не рендерим. Unique, если задан.
8. **Оплаты нет.** Кнопка в корзине не принимает карту и не шлёт заказ на бэк. «Скопировать текст» + ссылка `t.me/<username>` в новой вкладке (`target=_blank`). Username — в `src/config/site.ts`.
9. **Оптимизация без `React.memo`.** В `vite.config.ts` уже React Compiler (`babel-plugin-react-compiler`). Карточки и ленты в `memo` / `useCallback` «на всякий случай» не оборачивать. Сначала картинки, кэш списков, сплит админки — шаг 10.

## Страницы

| путь | кто | что |
|---|---|---|
| `/` | все | Hero + ленты марок / моделей / категорий + сетка запчастей + фильтры |
| `/parts/$partId` | все | Карточка запчасти: галерея, описание, в корзину / Telegram |
| `/contacts` | все | Телефон, адрес, часы, Telegram — из `src/config/site.ts` |
| `/cart` | все | Корзина из zustand |
| `/admin/login` | скрытая | Логин. В нав не ставить |
| `/admin/new/mark` | админ | Создать марку |
| `/admin/new/model` | админ | Создать модель |
| `/admin/new/category` | админ | Создать категорию |
| `/admin/new/part` | админ | Создать запчасть |

Редактирование — **модалка на месте**, не отдельный роут. Избранное — **sheet из шапки**, не страница.

Неавторизованный на `/admin/new/*` → редирект на `/admin/login`.

Пункты из дизайна «Доставка / Гарантия / О компании» — якоря на `/contacts`, отдельные роуты не плодим.

## Нав

Шапка: логотип, Каталог (`/#catalog`), Контакты, иконки избранного и корзины (счётчики), на мобиле — burger. Поиска в шапке и в каталоге нет.

Админ в шапке не светим. После логина — мелкий индикатор + выход, без пункта «Админка».

## Главная

Порядок блоков:

1. Hero: `src/components/home/HomeHero.tsx` — «Премиальные автозапчасти», схема тормозного диска, сетка, CTA «Перейти в каталог».
2. Лента **марок** — горизонтальный скролл. Клик = фильтр `markId`. Для админа первая плитка — `+` → `/admin/new/mark`.
3. Лента **моделей** — только если выбрана марка, иначе блок не рендерим. Только модели этой марки. Админ: `+` → `/admin/new/model`.
4. Лента **категорий** и сетка **запчастей** — если выбраны марка **и** модель. Иначе пользователю нечего показывать. Админ: `+` у категории и запчасти появляются вместе с этими блоками.

Фильтры через И. Если по марке/модели/категории нет запчастей, основная сетка не исчезает: карточка «По вашему запросу ничего не найдено» + «Сбросить фильтры» + ссылка в Telegram (`CatalogEmpty.tsx`). Блок **«Возможно, вам понадобится»** при этом может остаться ниже. Если выбрано авто, после основной сетки этот блок: универсальные запчасти (без марки/модели), запчасти на все модели этой марки и — если выбрана категория — товары других категорий той же модели. Коврик «для всех авто» не стоит рядом с масляным фильтром X5. Выбранное видно на лентах (рамка), отдельные чипы выбранного авто, слайдер цены и поиск по тексту не показываем. Основная сетка — **14 запчастей на страницу**, `page` в URL (`?page=2`); «Возможно, вам понадобится» только на первой странице.

### Карточка запчасти

Клик по фото/имени → `/parts/$partId`. Фото, название, марка, артикул (если есть), цена (бронза). Иконки: избранное (сердце) и корзина (`+` если нет в корзине, галочка если уже есть). Для админа — кебаб сверху слева: «Редактировать» / «Удалить».

### Страница запчасти

`/parts/$partId`: галерея до 3 фото, хлебные крошки-ссылки в каталог (`/?markId=&modelId=#catalog`), описание, копирование артикула, в корзину (`+` / галочка) / избранное / скопировать заказ + открыть Telegram. Ниже — «Возможно, вам понадобится» (до 6 карточек). Нет записи → `notFound`.

Карточки марки / модели / категории проще: фото или имя, выбранное состояние, тот же кебаб у админа. У категории фото нет — только имя.

## Корзина и избранное

- Корзина: `{ sparePartId, quantity }[]`. Добавить / изменить кол-во / убрать / очистить. Ключ `grozzapchasti.cart`.
- Избранное: `number[]` id запчастей. Тоггл. Ключ `grozzapchasti.favorites`.
- Сторы не ходят на бэк. Снапшот товара (имя, цена, фото) в стор не дублируем: id + данные из `useSparePartsQuery`. Если товар удалили — строка «больше недоступен», можно убрать.

### Оформить → Telegram (не оплата)

Оплатить на сайте нельзя. На `/cart` и на странице товара два шага, не автооткрытие с `?text=`:

1. По `sparePartId` из стора (или с карточки) собираем текст: шапка-шаблон + нумерованный список позиций (без итога).
2. Кнопка **«Скопировать текст»** — в буфер, после успеха галочка «Скопировано».
3. Иконка «открыть в новой вкладке» — `https://t.me/${site.telegram}` (`target="_blank"`). ОС откроет приложение, если оно стоит, иначе вкладку.

Текст в URL не кладём: приложение Telegram вставляет percent-encoding (`%D0%97…`) как есть.

Пример текста:

```
Здравствуйте! Хочу уточнить наличие и оформить заказ:

1. Масляный фильтр — арт. ABC-12 — 2 шт. × 1 200 ₽
2. Колодки передние — 1 шт. × 4 500 ₽
```

Шаблон шапки и username — константы в `src/config/site.ts` (`telegram`, `orderMessageIntro`), не хардкод в кнопке.

Ограничения (заложить сразу):

- В `?text=` кириллицу не передаём. Пользователь копирует текст и сам вставляет в чат.
- Позиции без данных (товар сняли с витрины) в сообщение не кладём; в корзине они как «больше недоступен».
- Корзину после клика не чистим: человек мог не отправить сообщение.

## Админ

`isAdmin` = есть JWT и `useMeQuery` ок. 401 → `logout()`, спрятать кебаб и плюсы.

### Кебаб → редактирование

Модалка с теми же полями, что у сущности. Стартовый снимок формы vs текущие значения. «Сохранить» `disabled`, пока нет изменений **или** форма невалидна. Новые фото = изменение. Пустой PATCH не слать.

Удаление — confirm. Марка/модель: предупредить про каскад. Категория с запчастями → 409, показать `message`.

### Плюс → страница создания

Свой `Title` на каждую:

| роут | title |
|---|---|
| `/admin/new/mark` | Новая марка |
| `/admin/new/model` | Новая модель |
| `/admin/new/category` | Новая категория |
| `/admin/new/part` | Новая запчасть |

В селектах иерархии **первая опция — «Добавить…»**. Клик открывает модалку создания той сущности (не уходим со страницы). После успеха модалка закрывается, новый id выбирается в селекте. 

### Поля по сущностям

Категория **ни к кому не привязана**. Это ярлык запчасти (Двигатель, Фильтры…). Нет фото, нет марки/модели.

| сущность | обязательно | опционально | фото |
|---|---|---|---|
| Марка | `name` | `description` | до 3, не обязательно |
| Модель | `name`, `markId` | `description` | до 3 |
| Категория | `name` | `description` | нет |
| Запчасть | `name`, `price`, `categoryId` | `article`, `description`, применимость | до 3 |

Применимость запчасти (селект в форме): **эта модель** (`markId`+`modelId`), **все модели марки** (`markId`, `modelId` null), **все автомобили** (оба null). Категория всегда обязательна. Модель в селекте — только от выбранной марки и только в режиме «эта модель». Смена марки сбрасывает модель.

Фото: jpeg/png/webp/gif, ≤ 10 МБ, ≤ 3. Удаление существующего — `DELETE .../images/:filename`, потом можно PATCH новые.

## Тема (design.md)

Жёсткая палитра, не выдумывать цвета:

| роль | hex | css-var |
|---|---|---|
| фон | `#0B0B0B` | `--background` |
| вторичный фон | `#121214` | `--secondary` / sidebar |
| карточка | `#1A1A1D` | `--card` |
| hover | `#2A2A2E` | `--accent` / `--muted` |
| бронза CTA/цена | `#B8874C` | `--primary` |
| светлая бронза | `#C7A17A` | hover primary |
| редкий акцент | `#E5C3A1` | линии / иконки |
| текст | `#F5F5F5` | `--foreground` |
| вторичный текст | `#A1A1A8` | `--muted-foreground` |
| граница | `#292929` | `--border` |

Шрифт **Manrope** (кириллица). Заголовки 600–700, кнопки/цены 500–600, текст 400–500. Geist убрать.

Бронза только на CTA, цене, active, мелких иконках. Радиус сдержанный (`--radius` меньше дефолтного shadcn). Карточки: тонкая граница, много воздуха, фото доминирует.

`ThemeProvider`: `defaultTheme="dark"`, `forcedTheme="dark"`.

## Адаптив

- `< 768`: 2 колонки запчастей (карточка компактная), ленты марок/моделей — горизонтальный скролл, шапка → sheet.
- `768–1024`: 2 колонки, обычный размер карточки.
- `> 1024`: 3 колонки, шапка строкой.
- Кебаб и плюс не должны перекрывать тап по карточке (`stopPropagation`).

## Карта файлов

```
front/src/
  routes/                 ← TanStack Router, file-based
    __root.tsx            шапка/подвал
    index.tsx             главная: hero + Catalog, search-params фильтров
    parts.$partId.tsx     страница запчасти
    contacts.tsx
    cart.tsx
    admin.login.tsx
    admin.new.tsx         layout: без JWT → /admin/login
    admin.new.mark.tsx
    admin.new.model.tsx
    admin.new.category.tsx
    admin.new.part.tsx
  components/
    ui/                   shadcn, не трогать без нужды
    layout/               Header, Footer, MobileNav, FavoritesSheet
    home/                 HomeHero
    catalog/              ленты, карточки, галерея, пагинация (`CatalogPagination`), AdminAddTile, кебаб на карточках
    cart/                 CartView, TelegramOrderActions
    admin/                kebab, lazy-dialogs, Edit*Dialog, ConfirmDelete, Create*Modal, PartFitFields, ImageField
  lib/                    format, catalog-search, part-fit, order-message
  stores/                 cart + favorites + catalog (марка/модель/категория)
  queries/                API, уже готово. Новые ручки — только сюда
  config/
    constants.ts          только API_URL (моки выкинуть на шаге 3)
    site.ts               контакты, telegram, шаблон заказа, секции, нав, копирайт
  page/                   устарело, не наращивать
```

Новый UI: сначала `pnpm dlx shadcn@latest add <name>`. Запросы: хуки из `@/queries`. Сторы: `@/stores`.

## Шаги (идти по порядку)

1. [x] Тема: CSS-токены + Manrope + `forcedTheme="dark"`.
   - `src/index.css` — палитра из таблицы ниже, `--radius: 0.375rem`, Geist убран, `@fontsource-variable/manrope` (`Manrope Variable`)
   - `src/main.tsx` — `ThemeProvider` с `defaultTheme="dark"` и `forcedTheme="dark"`
   - `index.html` — `lang="ru"`, `class="dark"` на `<html>`, title `Groz Zapchasti`
   - `src/components/ui/button.tsx` — hover CTA на `--primary-hover` (`#C7A17A`)
2. [x] TanStack Router + layout (шапка/подвал/мобиле) + пустые страницы.
   - `vite.config.ts` — `@tanstack/router-plugin` **перед** React-плагином
   - `src/main.tsx` — `RouterProvider` вместо `App.tsx` (файл удалён)
   - `src/routes/` — file-based роуты из карты выше; `admin.new.tsx` редиректит без JWT
   - `src/routeTree.gen.ts` — генерирует плагин, не править руками
   - `src/components/layout/Header.tsx` — лого, Каталог/Контакты, избранное, корзина, burger
   - `src/components/layout/Footer.tsx`, `MobileNav.tsx`
   - `src/queries/auth.ts` — `useIsAdmin()` = JWT + `useMeQuery` ok
   - Главная пока рендерит старые `Marks.root` / `Models.root` / `Zapchasti.root` — заменить на шаге 3
3. [x] Главная на API: ленты, фильтры в search-params, сетка, пустые состояния.
   - `src/routes/index.tsx` — `validateSearch` (`markId`, `modelId`, `categoryId`, `page`); `#catalog` — `min-h-[calc(100svh-4rem)]` под sticky-шапку `h-16`
   - `src/components/home/HomeHero.tsx` — hero главной: схема диска, техническая сетка, три подписи из `site.heroHighlights`
   - `src/lib/catalog-search.ts` — парсинг URL (марка / модель / категория / `page`); `CATALOG_PAGE_SIZE = 14`
   - `src/stores/catalog.ts` — persist выбранных марки / модели / категории
   - `src/lib/format.ts` — `formatPrice`, `filterSpareParts` (И на клиенте), `catalogPartsForView` (точная модель + «Возможно, вам понадобится»)
   - `src/components/catalog/` — `Catalog`, ленты марок/моделей, чипы категорий
   - пустая сетка: `CatalogEmpty.tsx` — «По вашему запросу ничего не найдено», сброс фильтров + Telegram; показывается и когда есть блок «Возможно, вам понадобится»
   - категории: чип «Все» первым (`CategoryChips`); инпут «Найти категорию» фильтрует чипы по имени; без `categoryId` — все товары марки/модели
   - ленты марок / моделей / категорий: подсказка «Выберите марку / модель / категорию»; если больше 10, в конце карточка «Показать все» (`ShowAll.tsx`, лимит в `lib/catalog-strip.ts`); клик раскрывает полный список с `flex-wrap`, «Свернуть» у заголовка
   - `Catalog`: модели только при выбранной марке; категории / сетка запчастей — при марке и модели
   - шаг 11: `Catalog` читает search-params, не только стор
   - `src/config/constants.ts` — моки удалены, остался `API_URL`
   - старые `Marks.root` / `Models.root` / `Zapchasti.root` удалены
4. [x] Карточки: избранное, корзина, адаптив.
   - `src/components/catalog/SparePartCard.tsx` — фото, имя, марка (джойн списка), артикул если есть, цена бронзой, heart/`+`/галочка (`stopPropagation`); на мобиле компактная под 2 колонки
   - иконка корзины: `Plus` если товара нет, `Check` если уже в корзине (бейдж количества убран)
   - `src/components/catalog/SparePartsGrid.tsx` — 2 / 2 / 3 колонки (`lg` 1024); при выбранном авто после сетки — «Возможно, вам понадобится»
   - слайдер цены убран (шаг 11)
5. [x] `/cart` + sheet избранного. «Оформить» = скопировать текст + открыть Telegram, оплаты нет.
   - `src/config/site.ts` — `telegram` (`kennynna` для теста), `orderMessageIntro`
   - `src/lib/order-message.ts` — текст заказа, `telegramChatHref` без `?text=`
   - `src/components/cart/TelegramOrderActions.tsx` — «Скопировать текст» (галочка после клика) + иконка `target=_blank` на `t.me/<username>`
   - `src/components/cart/CartView.tsx` — qty / убрать / очистить / TelegramOrderActions; снятый товар — «больше недоступен»
   - `src/routes/cart.tsx` — страница корзины
   - `src/components/layout/FavoritesSheet.tsx` — sheet из шапки: список, в корзину, убрать
6. [x] `/contacts` из `site.ts` (якоря Доставка/Гарантия/О компании + копирайт).
   - `src/config/site.ts` — `sections`, `footerNav`
   - `src/routes/contacts.tsx` — контакты + якоря `#delivery` `#warranty` `#about` + ссылка Telegram
   - `src/components/layout/Footer.tsx` — ссылки на якоря, копирайт, Telegram
7. [x] `/admin/login` + `isAdmin` в UI (плюсы; кебаб — шаг 8; индикатор в шапке уже есть).
   - `src/routes/admin.login.tsx` — форма логина, 401/ошибка API, редирект на `/` если уже админ
   - `src/components/catalog/AdminAddTile.tsx` — `+` только при пропе `isAdmin` (с шага 10), `stopPropagation`
   - ленты/сетка — плюс → `/admin/new/mark|model|category|part` (формы — шаг 9)
8. [x] Кебаб, модалка редактирования (dirty), удаление.
   - `src/components/admin/AdminKebab.tsx` — только при пропе `isAdmin` (с шага 10), `stopPropagation`
   - `EditMarkDialog` / `EditModelDialog` / `EditCategoryDialog` / `EditPartDialog` — те же поля, «Сохранить» disabled пока нет dirty или форма невалидна
   - `ImageField` — существующие фото + `DELETE .../images/:filename`, новые файлы = dirty
   - `ConfirmDeleteDialog` — марка/модель: каскад; категория: 409 показываем `message`
   - кебаб на `MarksStrip` / `ModelsStrip` / `CategoryChips` / `SparePartCard`
9. [x] Страницы `/admin/new/*`, селект «Добавить…» + вложенные модалки, фото.
   - `src/components/admin/ImageField.tsx` — до 3, jpeg/png/webp/gif, ≤ 10 МБ
   - `src/components/admin/EntitySelect.tsx` — первая опция «Добавить…» открывает модалку
   - `CreateMarkForm` / `CreateModelForm` / `CreateCategoryForm` / `CreatePartForm` (+ модалки)
   - применимость запчасти: эта модель / вся марка / все авто (`PartFitFields`); модель только от выбранной марки
   - после успеха на странице запчасти — тост «Запчасть успешно добавлена», форма сбрасывается, без редиректа; ошибка — `message` с бэка, поля не трогаем, можно повторить. Марка/модель/категория — тост и переход на `/`. Из модалки — закрыть и подставить новый id
   - `AdminFieldLabel` — у поля «обязательно» (бронза) или «необязательно» (серый); create и edit
10. [x] Оптимизация витрины. `React.memo` не трогать — Compiler уже в Vite.
    - `src/components/catalog/CardImage.tsx` — `loading="lazy"`, `decoding="async"`, `width`/`height`, `fetchPriority` у первых двух марок; превью корзины/избранного через тот же `CardImage`
    - `src/queries/query-client.ts` — `catalogQueryDefaults` (`staleTime` 5 мин, без `refetchOnWindowFocus`); размазано по `marks` / `models` / `categories` / `spare-parts` list+detail. `auth`/`me` не трогали
    - `src/routes/index.tsx` `loader` — `ensureQueryData` на четыре списка
    - `src/components/admin/lazy-dialogs.tsx` — `React.lazy` для `Edit*` и `ConfirmDelete`; ленты/сетка импортируют обёртки, чанки диалогов отдельно
    - `AdminKebab` / `AdminAddTile` — проп `isAdmin`, без `useMeQuery` на плитке; один `useIsAdmin()` в `Catalog` / `Header`
    - `FavoritesSheet` — `useSparePartsQuery({}, { enabled: open })`
    - `src/lib/format.ts` — один `Intl.NumberFormat('ru-RU')` на модуль
11. [x] Шаринг фильтров. Чипы выбранного авто и слайдер цены не показываем — выбор виден на лентах.
    - На `/` марка/модель/категория/`page` живут в URL (`catalog-search.ts`). Persist стора — запас, если пришли на `/` без query
    - `Catalog` пишет и URL, и стор в `patchCatalog`. `PriceFilter.tsx` удалён, `priceMin`/`priceMax` из URL убраны
12. [x] Поиск по имени и артикулу — **снят**. Поля нет, `q` из URL убран. `CatalogSearchField.tsx` удалён. Сетка только при марке и модели.
13. [x] Страница запчасти + галерея.
    - `src/routes/parts.$partId.tsx` — `/parts/$partId`, loader `sparePartsQueries.detail`, 404 → `notFound`
    - `src/components/catalog/ImageGallery.tsx` — до 3 фото, стрелки и превью
    - Карточка/корзина/избранное ведут на страницу. Артикул копируется. Telegram — `TelegramOrderActions`
    - На карточке `+` / галочка вместо сумки с бейджем (`SparePartCard`)
    - шаг 16: те же `+` / галочка на странице товара; крошки ведут в каталог с фильтрами; блок «Возможно, вам понадобится»
14. [x] Hero, контакты Telegram, 404, meta.
    - Hero — `src/components/home/HomeHero.tsx` (схема диска + `site.heroHighlights`); CTA только «Перейти в каталог»
    - `site.description` + meta на `/`, `/contacts`, `/cart`, `/parts/$partId`; `index.html`
    - `/contacts` и футер — ссылка на `t.me/<username>`
    - `__root.tsx` `notFoundComponent` — «Страница не найдена»
15. [x] Применимость запчасти: эта модель / вся марка / все авто.
    - `markId` / `modelId` опциональны. Универсальные не в основной сетке выбранной модели, а в «Возможно, вам понадобится»
    - `src/lib/part-fit.ts`, `src/components/admin/PartFitFields.tsx` — селект в создании и правке
    - карточка: «Для всех авто» / «BMW · все модели» / «BMW · X5» (`partFitLabel` + имя модели)
16. [x] Доводка витрины после шагов 1–15.
    - `src/lib/part-fit.ts` — `partFitLabel(part, mark, model)` → `BMW · X5`
    - `src/components/catalog/CardImage.tsx` — плейсхолдер без фото и при `onError`; сброс ошибки при смене `src`
    - `src/components/catalog/ImageGallery.tsx` — тот же плейсхолдер на главном фото и превью
    - `src/components/catalog/SparePartsGrid.tsx` — проп `models`, подпись применимости с моделью
    - `src/routes/parts.$partId.tsx` — `Plus`/`Check` как на карточке; крошки-`Link` в `/?markId=&modelId=#catalog`; `relatedPartsFor` (до 6)
    - `src/lib/format.ts` — `relatedPartsFor` (точное авто + универсальные / марка / категория)
    - `src/components/layout/FavoritesSheet.tsx` — клик по товару закрывает sheet
    - `src/routes/__root.tsx` — `errorComponent` в том же Shell (шапка/подвал)
    - пагинация основной сетки: 14 шт., `page` в URL, `CatalogPagination.tsx`; смена фильтров сбрасывает страницу

## Дырки бэка

Нет. Артикул (`SparePart.article`) опциональный, unique если задан.

Не делаем, пока не попросите:

- Заказы / оплата / регистрация покупателей. Оформление — только ссылка в Telegram из корзины.
- Поиск по названию / артикулу в каталоге.
- Контакты в БД — статично в `site.ts`.
- Фото у категории.
- Привязка категории к марке/модели.
- Вложенные mark/model в ответе запчасти — джойним на клиенте из списков.
- `React.memo` / ручной `useCallback` на карточках — React Compiler уже включён.
- Виртуализация сетки (`@tanstack/react-virtual`) — каталог маленький, рано.
- Превью/ресайз фото на бэке, CDN, `srcset` — отдельный бэк-шаг. На фронте только lazy/async.

Категория: `POST /api/categories` = `name` + `description?`. Этого достаточно.
