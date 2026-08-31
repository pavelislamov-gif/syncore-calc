# ClusterXview

Локальная производственная система для подготовки заказов к производству.

ClusterXview помогает ответить на вопросы: что производим, из чего состоит изделие, хватает ли комплектующих, сколько можно собрать, что заказать и когда заказ готов к производству.

## Требования

- Docker и Docker Compose **или**
- Python 3.12+, Node.js 22+, PostgreSQL 16+

## Быстрый старт (Docker)

```bash
cd clusterxview
cp .env.example .env
docker compose up --build
```

Приложение: **http://localhost:3000** (или `http://192.168.x.x:3000` в локальной сети)

API и Swagger: **http://localhost:8000/docs**

## Demo-пользователи

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| director | director123 | Руководитель |
| technologist | technologist123 | Технолог |
| constructor | constructor123 | Конструктор |
| supply | supply123 | Снабжение |
| production | production123 | Производство |
| quality | quality123 | ОТК |

**Смените пароли после первого входа** (`must_change_password=true`).

## Demo-данные

При первом запуске (`SEED_DEMO=true`) создаются:

- Изделие **Светильник ЛС-100** со спецификацией Rev.C
- Остатки комплектующих (драйвер DR-100: 700 шт.)
- Заказ **№152** на 500 шт. (дефицит DR-100: 300, винт M4×10: 500)
- Расчёт сборки: **350 шт.**, ограничитель — DR-100

## Запуск без Docker

### PostgreSQL

```bash
createdb clusterxview
# или через psql: CREATE USER clusterxview WITH PASSWORD 'clusterxview';
```

### Backend

```bash
cd clusterxview/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://clusterxview:clusterxview@localhost:5432/clusterxview
export JWT_SECRET=dev-secret
export SEED_DEMO=true
mkdir -p /tmp/clusterxview/documents /tmp/clusterxview/backups
export DOCUMENTS_DIR=/tmp/clusterxview/documents
export BACKUPS_DIR=/tmp/clusterxview/backups
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd clusterxview/frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 (прокси `/api` → backend)

## Доступ из локальной сети

Docker Compose публикует frontend на `0.0.0.0:3000`. Откройте с другого компьютера:

```
http://<IP-сервера>:3000
```

Добавьте IP в `CORS_ORIGINS` в `.env`.

## Backup и восстановление

```bash
# В Docker
docker compose exec backend sh /app/../scripts/backup.sh

# Или вручную
pg_dump $DATABASE_URL > backup.sql
tar -czf documents.tar.gz /data/documents
```

Восстановление:

```bash
psql $DATABASE_URL < backup.sql
```

## Тестирование

```bash
cd clusterxview/backend
pip install -r requirements.txt
pytest
```

Или в Docker:

```bash
docker compose exec backend pytest
```

Тесты покрывают: потребность, дефицит, резерв, сборку, ограничивающую комплектующую, «на сколько хватит», увеличение выпуска, перерасчёт, несколько заказов.

## Структура

```
clusterxview/
├── backend/     FastAPI + SQLAlchemy + PostgreSQL
├── frontend/    React + TypeScript + Vite + Tailwind
├── scripts/     backup.sh, restore.sh
└── docker-compose.yml
```

## Основные разделы

- **Dashboard** — активные заказы, блокеры, что можно собрать
- **Заказы** — карточка заказа с потребностью, дефицитом, готовностью
- **Сборка** — сколько можно собрать, ограничивающий компонент, что купить
- **Остатки** — управление остатками (снабжение)
- **Снабжение** — дефициты и поставки
- **Конструктор** — документы и актуальность
- **Проблемы** — ручные и автоматические

## API

REST API с префиксом `/api`. Документация: `/docs` (Swagger/OpenAPI).

Примеры:

- `GET /api/products`
- `POST /api/orders`
- `POST /api/orders/{id}/calculate`
- `GET /api/assembly/{product_id}`
- `GET /api/dashboard`

## Лицензия

Внутреннее использование предприятия.
