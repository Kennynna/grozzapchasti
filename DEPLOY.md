# Деплой grozzapchasti на Ubuntu

Один сервер: Nginx отдаёт фронт и проксирует API, NestJS слушает только localhost, Postgres в Docker.

```
браузер
  → Nginx :80 / :443
       /          front/dist  (SPA)
       /api       127.0.0.1:4060
       /uploads   127.0.0.1:4060
  → NestJS (systemd)
  → Postgres (Docker, порт только 127.0.0.1:5432)
```

Фронт ходит на `/api` и `/uploads` с того же домена. Отдельный URL бэка не нужен.

Нужны Ubuntu 22.04 / 24.04 и **домен на IP сервера**. Без HTTPS админка в Chrome будет ругаться на пароль (форма «не защищена» + проверка утечек). На голый HTTP по IP не выкладывайте.

Готовые файлы лежат в `deploy/`.

---

## 1. Пакеты

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg ufw nginx
```

### Docker (Postgres)

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Выйти из SSH и зайти снова, чтобы группа `docker` подхватилась. Проверка: `docker compose version`.

### Node.js 22 и pnpm

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate
node -v   # v22.x
pnpm -v
```

### Файрвол

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Порты `4060` (бэк) и `5432` (Postgres) наружу не открывать.

---

## 2. Код

```bash
sudo mkdir -p /var/www/grozzapchasti
sudo chown "$USER":"$USER" /var/www/grozzapchasti
git clone <URL_РЕПО> /var/www/grozzapchasti
cd /var/www/grozzapchasti
```

---

## 3. Postgres

В `backend/docker-compose.yml` порт уже привязан к localhost (`127.0.0.1:5432`). Смените `POSTGRES_PASSWORD` в compose **до** первого запуска и продублируйте его в `DATABASE_URL`.

```bash
cd /var/www/grozzapchasti/backend
nano docker-compose.yml   # POSTGRES_PASSWORD
docker compose up -d
docker compose ps
```

Контейнер `grozzapchasti-postgres` должен быть `running`. Данные в volume `postgres_data`. Стереть БД: `docker compose down -v` (необратимо).

---

## 4. Бэкенд

```bash
cd /var/www/grozzapchasti/backend
cp .env.example .env
nano .env
```

```env
DATABASE_URL="postgresql://zapchasti:СВОЙ_ПАРОЛЬ_POSTGRES@127.0.0.1:5432/grozzapchastiDB"
PORT=4060
FRONTEND_ORIGIN="https://ВАШ_ДОМЕН"
NODE_ENV=production

JWT_SECRET="вставьте-вывод-openssl"
ADMIN_LOGIN="ваш-логин"
ADMIN_PASSWORD="ваш-сложный-пароль"
```

Секреты:

```bash
openssl rand -base64 48
```

`ADMIN_PASSWORD` не короче 10 символов и **не** `admin` / `password` / `123456`. Иначе бэк не стартует (первый админ) или Chrome снова покажет «пароль найден в утечке».

Админ в БД создаётся один раз, если таблица пустая. Потом правка `.env` хеш сама не меняет — после смены пароля:

```bash
npm run db:set-admin
```

На проде `NODE_ENV=production`: JWT не шаблонный, `FRONTEND_ORIGIN` только `https://…` без `/` в конце.

### Схема и сборка

dev-зависимости нужны (`prisma`, `@nestjs/cli`). Ставьте полный `npm ci`.

```bash
cd /var/www/grozzapchasti/backend
npm ci
npx prisma contract emit
npx prisma db init
npm run build
```

Демо-каталог (BMW / Mercedes / Toyota) не обязателен. Сид **стирает** марки, модели, категории и запчасти:

```bash
# только если нужна тестовая витрина
npm run db:seed
```

Фото пишутся в `backend/uploads/`.

### systemd

```bash
sudo cp /var/www/grozzapchasti/deploy/grozzapchasti-api.service /etc/systemd/system/
sudo chown -R www-data:www-data /var/www/grozzapchasti/backend
sudo chmod 640 /var/www/grozzapchasti/backend/.env
sudo chmod 750 /var/www/grozzapchasti/backend/uploads
sudo systemctl daemon-reload
sudo systemctl enable --now grozzapchasti-api
sudo systemctl status grozzapchasti-api
```

Проверка с сервера:

```bash
curl -sS http://127.0.0.1:4060/api/health
curl -sS http://127.0.0.1:4060/api/marks
```

Первый должен вернуть `{"ok":true}`. Логи: `journalctl -u grozzapchasti-api -f`.

---

## 5. Фронт

```bash
cd /var/www/grozzapchasti/front
pnpm install --frozen-lockfile
pnpm build
```

Статика в `/var/www/grozzapchasti/front/dist`. Nginx должен её читать:

```bash
sudo chown -R "$USER":www-data /var/www/grozzapchasti/front/dist
sudo chmod -R g+rX /var/www/grozzapchasti/front/dist
```

`API_URL` уже `/api` — ничего не подставлять, если Nginx проксирует `/api` и `/uploads`.

---

## 6. Nginx и HTTPS

Подставьте домен в `deploy/nginx.conf` (`server_name`).

```bash
sudo cp /var/www/grozzapchasti/deploy/nginx.conf /etc/nginx/sites-available/grozzapchasti
sudo nano /etc/nginx/sites-available/grozzapchasti
sudo ln -s /etc/nginx/sites-available/grozzapchasti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

`try_files` нужен TanStack Router: `/cart`, `/contacts`, `/admin/login` — клиентские маршруты.

Когда домен резолвится на сервер:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ВАШ_ДОМЕН
```

Certbot допишет 443 и редирект с HTTP. Продление: `sudo certbot renew --dry-run`.

После сертификата в `backend/.env` — `FRONTEND_ORIGIN="https://ВАШ_ДОМЕН"`, затем:

```bash
sudo systemctl restart grozzapchasti-api
```

Откройте `https://ВАШ_ДОМЕН`.

---

## 7. Обновление

```bash
cd /var/www/grozzapchasti
git pull

cd backend
npm ci
npx prisma contract emit
npx prisma db update
npm run build
sudo systemctl restart grozzapchasti-api

cd ../front
pnpm install --frozen-lockfile
pnpm build
sudo chmod -R g+rX dist
```

`db update` — когда менялась схема Prisma. Первый раз на пустой БД — `db init` (шаг 4).

Сиды при обновлении **не** гонять. После `git pull` проверьте, что `.env` на месте.

---

## 8. Что проверить

- `https://` открывается, в адресной строке замок, не «Не защищено».
- Ленты марок / моделей / запчастей грузятся.
- Фото открываются по `/uploads/...`.
- `/cart` и `/contacts` не отдают 404 Nginx.
- `/admin/login` — вход с логином/паролем из `.env` (после `db:set-admin`, если меняли). Браузер **не** должен писать про утечку пароля.
- После логина можно создать марку с фото; файл в `backend/uploads/marks/`.
- Сессия админа живёт 12 часов (потом снова логин).

---

## 9. Если сломалось

| Симптом | Что смотреть |
|---|---|
| 502 на `/api` | `sudo systemctl status grozzapchasti-api`, `journalctl -u grozzapchasti-api -n 80` |
| API падает сразу | `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` (на проде только https), контейнер Postgres |
| Пустая витрина, CORS | `FRONTEND_ORIGIN` совпадает с адресом в браузере, без `/` в конце |
| Фото 404 | WorkingDirectory = `backend/`, есть `uploads/`, Nginx проксирует `/uploads/` |
| Не логинится админ | пароль из `.env` пишется в БД только при первом старте или `npm run db:set-admin` |
| Chrome: «пароль найден в утечке» | пароль вроде `admin` — смените и выполните `npm run db:set-admin`; нужен HTTPS |
| 413 при загрузке фото | `client_max_body_size` в Nginx |
| `/cart` → 404 | `try_files` в `location /` |
| Нет прав на запись фото | `www-data` владеет `backend/uploads` |

```bash
sudo systemctl restart grozzapchasti-api
docker compose -f /var/www/grozzapchasti/backend/docker-compose.yml logs -f --tail=50
sudo nginx -t && sudo systemctl reload nginx
```

---

## Безопасность (что уже в коде)

- JWT в `sessionStorage`, не в `localStorage`. Срок 12 часов.
- Логин ограничен: 5 попыток / 15 минут.
- Пароли `admin` / `password` / короче 10 символов бэк не примет при создании админа.
- На проде бэк не стартует с шаблонным `JWT_SECRET` или `http://` в `FRONTEND_ORIGIN`.
- Фото: только jpeg/png/webp/gif, ≤ 10 МБ, имя uuid, путь без `..`.
- Postgres слушает только localhost.
- Helmet на API, заголовки в `deploy/nginx.conf`.
- `/admin` закрыт в `robots.txt`, страница логина с `noindex`.

Не коммитить `backend/.env`. После деплоя смените пароль Postgres в compose, если оставляли пример.

---

## Кратко по файлам

| Что | Где |
|---|---|
| Код | `/var/www/grozzapchasti` |
| Env бэка | `backend/.env` (не в git) |
| Фото | `backend/uploads/` |
| Сборка фронта | `front/dist` |
| Unit бэка | `deploy/grozzapchasti-api.service` → `/etc/systemd/system/` |
| Nginx | `deploy/nginx.conf` → `/etc/nginx/sites-available/grozzapchasti` |
| Локальный запуск | `PLAN.md` § «Как гонять локально» |
