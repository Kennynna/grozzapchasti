# Деплой grozzapchasti на Ubuntu

Один сервер: Nginx раздаёт фронт и проксирует API, NestJS слушает localhost, Postgres в Docker.

```
браузер
  → Nginx :80 / :443
       /          front/dist  (SPA)
       /api       127.0.0.1:4060
       /uploads   127.0.0.1:4060
  → NestJS (systemd)
  → Postgres (Docker, порт только на localhost)
```

Фронт ходит на `/api` и `/uploads` с того же домена (`front/src/config/constants.ts`). Отдельный URL бэка не нужен.

Подходит Ubuntu 22.04 / 24.04. Нужен домен, смотрящий на IP сервера (для HTTPS). Без домена можно на IP по HTTP — SSL тогда пропустить.

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

Если репозиторий ещё не на сервере — скопируйте проект (`scp -r` / `rsync`).

---

## 3. Postgres

В `backend/docker-compose.yml` Postgres торчит на `0.0.0.0:5432`. На проде привяжите только localhost.

```bash
cd /var/www/grozzapchasti/backend
```

В `docker-compose.yml` замените блок `ports:` на:

```yaml
    ports:
      - '127.0.0.1:5432:5432'
```

Дальше:

```bash
docker compose up -d
docker compose ps
```

Контейнер `grozzapchasti-postgres` должен быть `running`. Данные лежат в volume `postgres_data` — `docker compose down` их не удаляет. Стереть БД: `docker compose down -v` (необратимо).

---

## 4. Бэкенд

```bash
cd /var/www/grozzapchasti/backend
cp .env.example .env
nano .env
```

Поставьте **свои** значения. Локальные `admin` / `admin` на прод не оставлять.

```env
DATABASE_URL="postgresql://zapchasti:zapzhasti123@127.0.0.1:5432/grozzapchastiDB"
PORT=4060
FRONTEND_ORIGIN="https://ВАШ_ДОМЕН"

JWT_SECRET="вставьте-длинную-случайную-строку"
ADMIN_LOGIN="ваш-логин"
ADMIN_PASSWORD="ваш-сложный-пароль"
```

Секрет:

```bash
openssl rand -base64 48
```

Пароль Postgres в `DATABASE_URL` должен совпадать с `POSTGRES_PASSWORD` в compose. Если меняете — поменяйте в обоих местах **до** первого `docker compose up`.

`FRONTEND_ORIGIN` — публичный URL сайта без слэша в конце: `https://zapchasti.example.com`.

Админ создаётся **один раз** при старте бэка, если таблица `Admin` пустая. Потом смена `ADMIN_PASSWORD` в `.env` хеш в БД сама не обновит.

### Схема и сборка

dev-зависимости нужны: `prisma` и `@nestjs/cli` там, не в `dependencies`. На сервере ставьте полный `npm ci`.

```bash
cd /var/www/grozzapchasti/backend
npm ci
npx prisma contract emit
npx prisma db init
npm run build
```

Демо-каталог (BMW / Mercedes / Toyota) **не обязателен**. Сид **стирает** марки, модели, категории и запчасти:

```bash
# только если нужна тестовая витрина
npm run db:seed
```

Фото пишутся в `backend/uploads/` (это текущая директория процесса). Папка уже есть в репо (`.gitkeep`).

### systemd

```bash
sudo nano /etc/systemd/system/grozzapchasti-api.service
```

```ini
[Unit]
Description=grozzapchasti API
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/grozzapchasti/backend
Environment=NODE_ENV=production
EnvironmentFile=/var/www/grozzapchasti/backend/.env
ExecStart=/usr/bin/node dist/main
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Права: процесс должен читать код и писать фото.

```bash
sudo chown -R www-data:www-data /var/www/grozzapchasti/backend
sudo chmod 640 /var/www/grozzapchasti/backend/.env
sudo chmod 750 /var/www/grozzapchasti/backend/uploads
sudo systemctl daemon-reload
sudo systemctl enable --now grozzapchasti-api
sudo systemctl status grozzapchasti-api
```

Проверка с сервера:

```bash
curl -sS http://127.0.0.1:4060/api/marks
```

Должен прийти JSON-список (можно пустой `[]`). Логи: `journalctl -u grozzapchasti-api -f`.

---

## 5. Фронт

```bash
cd /var/www/grozzapchasti/front
pnpm install --frozen-lockfile
pnpm build
```

Статика окажется в `/var/www/grozzapchasti/front/dist`. Nginx должен её читать:

```bash
sudo chown -R "$USER":www-data /var/www/grozzapchasti/front/dist
sudo chmod -R g+rX /var/www/grozzapchasti/front/dist
```

`API_URL` уже `/api` — на проде ничего подставлять не нужно, если Nginx проксирует `/api` и `/uploads` на тот же хост.

---

## 6. Nginx

Подставьте домен вместо `ВАШ_ДОМЕН`.

```bash
sudo nano /etc/nginx/sites-available/grozzapchasti
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ВАШ_ДОМЕН;

    client_max_body_size 32m;

    root /var/www/grozzapchasti/front/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4060;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4060;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`try_files` нужен TanStack Router: `/cart`, `/contacts`, `/admin/login` — это клиентские маршруты, не файлы.

```bash
sudo ln -s /etc/nginx/sites-available/grozzapchasti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Откройте `http://ВАШ_ДОМЕН` — должна открыться витрина.

### HTTPS

Когда домен уже резолвится на сервер:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ВАШ_ДОМЕН
```

Certbot сам допишет 443 и редирект с HTTP. Продление: `sudo certbot renew --dry-run`.

После выдачи сертификата в `backend/.env` должен быть `FRONTEND_ORIGIN="https://ВАШ_ДОМЕН"`, затем:

```bash
sudo systemctl restart grozzapchasti-api
```

---

## 7. Обновление

```bash
cd /var/www/grozzapchasti
git pull

# бэк
cd backend
npm ci
npx prisma contract emit
npx prisma db update
npm run build
sudo systemctl restart grozzapchasti-api

# фронт
cd ../front
pnpm install --frozen-lockfile
pnpm build
sudo chmod -R g+rX dist
```

`db update` — когда менялась схема Prisma. Первый раз на пустой БД — `db init` (шаг 4), не `db update`.

Сиды при обновлении **не** гонять: они удаляют каталог.

После `git pull` проверьте, что `.env` на месте (в git его нет).

---

## 8. Что проверить

- Главная открывается, ленты марок / моделей / запчастей грузятся.
- Фото в карточках (если уже загружали) открываются по `/uploads/...`.
- `/cart` и `/contacts` не отдают 404 Nginx (отдаётся `index.html`).
- `/admin/login` — вход с `ADMIN_LOGIN` / `ADMIN_PASSWORD` из `.env`.
- После логина можно создать марку с фото; файл появляется в `backend/uploads/marks/`.

---

## 9. Если сломалось

| Симптом | Что смотреть |
|---|---|
| 502 на `/api` | `sudo systemctl status grozzapchasti-api`, `journalctl -u grozzapchasti-api -n 80` |
| API падает сразу | `DATABASE_URL`, контейнер: `docker compose -f /var/www/grozzapchasti/backend/docker-compose.yml ps` |
| Пустая витрина, в консоли CORS | `FRONTEND_ORIGIN` совпадает с адресом в браузере (`https://...`, без `/` в конце) |
| Фото 404 | бэк запущен из `backend/` (WorkingDirectory), папка `uploads/` существует, Nginx проксирует `/uploads/` |
| Не логинится админ | пароль из `.env` действует только при **первом** старте; дальше — запись в таблице `Admin` |
| 413 при загрузке фото | `client_max_body_size` в Nginx |
| `/cart` → 404 | `try_files` в `location /` |
| Нет прав на запись фото | `www-data` владеет `backend/uploads` |

Полезные команды:

```bash
sudo systemctl restart grozzapchasti-api
docker compose -f /var/www/grozzapchasti/backend/docker-compose.yml logs -f --tail=50
sudo nginx -t && sudo systemctl reload nginx
```

---

## Кратко по файлам

| Что | Где |
|---|---|
| Код | `/var/www/grozzapchasti` |
| Env бэка | `backend/.env` (не коммитить) |
| Фото | `backend/uploads/` |
| Сборка фронта | `front/dist` |
| Unit бэка | `/etc/systemd/system/grozzapchasti-api.service` |
| Nginx | `/etc/nginx/sites-available/grozzapchasti` |
| Локальный запуск | `PLAN.md` § «Как гонять локально» |
