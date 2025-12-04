# Booking Service - Сервис бронирования

## Обзор

Booking Service - основной сервис для управления бронированиями в системе коворкинга. Обеспечивает полный цикл работы с зонами, местами, слотами и бронированиями.

## Основные функции

- 🏢 Управление коворкинг-зонами
- 💺 Управление местами в зонах
- ⏰ Управление временными слотами
- 📅 Создание и отмена бронирований
- 📊 История бронирований с фильтрацией
- ⏱️ Продление активных бронирований
- 👨‍💼 Админ-функции для управления системой
- 🔒 Закрытие зон на обслуживание

## Технологический стек

- **Framework**: FastAPI
- **ORM**: SQLAlchemy (асинхронный)
- **База данных**: PostgreSQL
- **Аутентификация**: JWT (декодирование токенов)
- **Валидация**: Pydantic

## Структура проекта

```
services/booking-service/
├── main.py           # Точка входа приложения
├── models.py         # SQLAlchemy модели
├── crud.py           # CRUD операции с БД
├── routes.py         # API эндпоинты для пользователей
├── admin.py          # API эндпоинты для администраторов
├── schemas.py        # Pydantic схемы
├── db.py             # Настройка асинхронной БД
├── security.py       # JWT декодирование и авторизация
├── config.py         # Конфигурация
├── requirements.txt  # Python зависимости
├── Dockerfile        # Docker конфигурация
├── tests/            # Тесты
└── README.md         # Документация
```

## API Эндпоинты

### Пользовательские эндпоинты

#### GET /zones

Получить список всех зон.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Главный коворкинг",
    "address": "пр. Гагарина 15",
    "is_active": true,
    "created_at": "2025-01-01T10:00:00",
    "updated_at": "2025-01-01T10:00:00"
  }
]
```

#### GET /zones/{zone_id}/places

Получить список мест в зоне.

**Response (200):**
```json
[
  {
    "id": 1,
    "zone_id": 1,
    "name": "Место A1",
    "is_active": true,
    "created_at": "2025-01-01T10:00:00",
    "updated_at": "2025-01-01T10:00:00"
  }
]
```

#### GET /places/{place_id}/slots?date=2025-01-15

Получить доступные слоты для места на конкретную дату.

**Query Parameters:**
- `date` (required): Дата в формате YYYY-MM-DD

**Response (200):**
```json
[
  {
    "id": 1,
    "place_id": 1,
    "start_time": "2025-01-15T09:00:00",
    "end_time": "2025-01-15T10:00:00",
    "is_available": true
  }
]
```

#### POST /bookings

Создать новое бронирование. Требует авторизации.

**Request Body:**
```json
{
  "slot_id": 1
}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 123,
  "slot_id": 1,
  "status": "active",
  "created_at": "2025-01-15T08:00:00",
  "updated_at": "2025-01-15T08:00:00"
}
```

**Errors:**
- 400: Слот недоступен или уже забронирован
- 401: Неавторизован

#### POST /bookings/cancel

Отменить бронирование. Требует авторизации.

**Request Body:**
```json
{
  "booking_id": 1
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 123,
  "slot_id": 1,
  "status": "cancelled",
  "created_at": "2025-01-15T08:00:00",
  "updated_at": "2025-01-15T09:00:00"
}
```

**Errors:**
- 404: Бронь не найдена или нет прав

#### GET /bookings/history

Получить историю бронирований пользователя. Требует авторизации.

**Query Parameters:**
- `status` (optional): Фильтр по статусу (active, cancelled, completed)
- `zone_id` (optional): Фильтр по зоне
- `date_from` (optional): Дата начала периода (ISO 8601)
- `date_to` (optional): Дата окончания периода (ISO 8601)

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "slot_id": 1,
    "status": "active",
    "created_at": "2025-01-15T08:00:00",
    "updated_at": "2025-01-15T08:00:00"
  }
]
```

#### POST /bookings/{booking_id}/extend

Продлить активное бронирование на следующий слот. Требует авторизации.

**Response (200):**
```json
{
  "id": 1,
  "user_id": 123,
  "slot_id": 2,
  "status": "active",
  "created_at": "2025-01-15T08:00:00",
  "updated_at": "2025-01-15T09:30:00"
}
```

**Errors:**
- 400: Невозможно продлить (следующий слот занят или бронь неактивна)

### Административные эндпоинты

#### POST /admin/zones

Создать новую зону. Требует прав администратора.

**Request Body:**
```json
{
  "name": "Новый коворкинг",
  "address": "ул. Ленина 1",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Новый коворкинг",
  "address": "ул. Ленина 1",
  "is_active": true,
  "created_at": "2025-01-15T10:00:00",
  "updated_at": "2025-01-15T10:00:00"
}
```

#### PATCH /admin/zones/{zone_id}

Обновить зону. Требует прав администратора.

**Request Body:**
```json
{
  "name": "Обновленное название",
  "is_active": false
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Обновленное название",
  "address": "ул. Ленина 1",
  "is_active": false,
  "created_at": "2025-01-15T10:00:00",
  "updated_at": "2025-01-15T11:00:00"
}
```

#### DELETE /admin/zones/{zone_id}

Удалить зону. Требует прав администратора.

**Response (204):** Нет тела ответа

**Errors:**
- 404: Зона не найдена

#### POST /admin/zones/{zone_id}/close

Закрыть зону на обслуживание с автоматической отменой всех бронирований в указанный период.

**Request Body:**
```json
{
  "reason": "Плановая уборка",
  "from_time": "2025-02-01T10:00:00",
  "to_time": "2025-02-01T18:00:00"
}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "slot_id": 1,
    "status": "cancelled",
    "created_at": "2025-01-15T08:00:00",
    "updated_at": "2025-01-15T12:00:00"
  }
]
```

## Модели данных

### Zone (Зона)

```python
class Zone(Base):
    __tablename__ = 'zones'
    
    id: int                    # Уникальный идентификатор
    name: str                  # Название зоны
    address: str | None        # Адрес
    is_active: bool = True     # Активна ли зона
    created_at: datetime       # Дата создания
    updated_at: datetime       # Дата обновления
```

### Place (Место)

```python
class Place(Base):
    __tablename__ = 'places'
    
    id: int                    # Уникальный идентификатор
    zone_id: int              # ID зоны
    name: str                  # Название места
    is_active: bool = True     # Активно ли место
    created_at: datetime       # Дата создания
    updated_at: datetime       # Дата обновления
```

### Slot (Слот)

```python
class Slot(Base):
    __tablename__ = 'slots'
    
    id: int                    # Уникальный идентификатор
    place_id: int             # ID места
    start_time: datetime       # Время начала
    end_time: datetime         # Время окончания
    is_available: bool = True  # Доступен ли слот
```

### Booking (Бронирование)

```python
class Booking(Base):
    __tablename__ = 'bookings'
    
    id: int                    # Уникальный идентификатор
    user_id: int              # ID пользователя
    slot_id: int              # ID слота
    status: str               # Статус: active, cancelled, completed
    created_at: datetime       # Дата создания
    updated_at: datetime       # Дата обновления
```

## Переменные окружения

```bash
# База данных
DATABASE_URL=postgresql+asyncpg://booking_user:password@booking-db:5432/booking_db

# JWT секрет (должен совпадать с User Service)
SECRET_KEY=your-secret-key-change-in-production

# Порт сервиса
PORT=8002
```

## Установка и запуск

### Локальный запуск

1. Установите зависимости:
```bash
cd services/booking-service
pip install -r requirements.txt
```

2. Настройте переменные окружения

3. Запустите сервис:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

Сервис будет доступен на `http://localhost:8002`.

### Docker

```bash
docker build -t booking-service .
docker run -p 8002:8002 --env-file .env booking-service
```

### Docker Compose

```bash
docker-compose up booking-service
```

## Авторизация и безопасность

### JWT токены

Сервис декодирует JWT токены из заголовка Authorization:

```python
from security import get_current_user_id

@router.post("/bookings")
async def create_booking(
    user_id: int = Depends(get_current_user_id)
):
    # user_id извлекается из JWT токена
```

### Права администратора

Для административных эндпоинтов требуется `is_admin=True` в JWT токене:

```python
from security import require_admin

@router.post("/admin/zones")
async def create_zone(
    _: None = Depends(require_admin)
):
    # Проверяет, что пользователь - администратор
```

## Бизнес-логика

### Создание бронирования

1. Проверяется доступность слота (`is_available=True`)
2. Создается бронирование со статусом `active`
3. Слот помечается как недоступный (`is_available=False`)
4. Возвращается созданное бронирование

### Отмена бронирования

1. Проверяется, что бронирование принадлежит пользователю
2. Статус меняется на `cancelled`
3. Связанный слот становится доступным
4. Обновляется `updated_at`

### Продление бронирования

1. Находится текущий слот бронирования
2. Ищется следующий слот (по времени) для того же места
3. Проверяется доступность следующего слота
4. Обновляется `slot_id` в бронировании
5. Старый слот освобождается, новый занимается

### Закрытие зоны

1. Находятся все места в зоне
2. Находятся все слоты этих мест в указанном периоде
3. Находятся все активные бронирования этих слотов
4. Все бронирования отменяются
5. Возвращается список отмененных бронирований

## Интеграция с другими сервисами

### API Gateway

```
/bookings/* → http://booking-service:8002/*
```

### User Service

Booking Service полагается на JWT токены, созданные User Service.

### Notification Service

Рекомендуется интегрировать для уведомлений:
- При создании бронирования
- При отмене бронирования
- При закрытии зоны администратором

## Тестирование

### Базовые тесты

```bash
pytest tests/test_crud_basic.py
```

### Пример теста

```python
async def test_create_booking():
    # Создать зону, место, слот
    # Создать бронирование
    # Проверить, что слот стал недоступен
```

## Архитектура

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Booking Service     │
│                     │
│ ┌─────────────────┐ │
│ │ Routes (User)   │ │
│ ├─────────────────┤ │
│ │ Admin Routes    │ │
│ ├─────────────────┤ │
│ │ CRUD Operations │ │
│ ├─────────────────┤ │
│ │ Security        │ │
│ └─────────────────┘ │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │
│(booking_db) │
└─────────────┘
```

## Асинхронность

Сервис использует асинхронный SQLAlchemy для лучшей производительности:

```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
```

## Миграции

База данных инициализируется автоматически при запуске.

Для продакшена рекомендуется использовать Alembic:

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Мониторинг

- **Health check**: `GET /` возвращает `{"status": "ok"}`
- **Docs**: Swagger UI на `/docs`
- **Метрики**: Рекомендуется добавить Prometheus metrics

## Известные ограничения

- Нет автоматического завершения бронирований (status: completed)
- Нет проверки на конфликты времени при создании слотов
- Нет ограничения на количество одновременных бронирований одним пользователем
- Нет уведомлений пользователям при отмене бронирований администратором

## Планы развития

- [ ] Автоматическое завершение бронирований по времени
- [ ] Интеграция с Notification Service
- [ ] Добавить валидацию временных слотов
- [ ] Реализовать систему рейтингов мест
- [ ] Добавить комментарии к бронированиям
- [ ] Статистика использования зон
- [ ] Экспорт истории бронирований
- [ ] Повторяющиеся бронирования

## Troubleshooting

### Проблема: Слоты не становятся доступными после отмены

**Решение**: Проверьте логику в `crud.cancel_booking()`:
```python
slot.is_available = True
await session.commit()
```

### Проблема: Ошибки JWT декодирования

**Решение**: Убедитесь, что SECRET_KEY совпадает с User Service.

### Проблема: Асинхронные ошибки

**Решение**: Все database операции должны использовать `await`:
```python
result = await session.execute(query)
```

---

**Версия**: 1.0.0  
**Порт по умолчанию**: 8002  
**Документация API**: http://localhost:8002/docs