# User Service - Сервис управления пользователями

## Обзор

User Service отвечает за управление пользователями системы бронирования коворкинга. Сервис обеспечивает полный цикл работы с пользователями: от регистрации до восстановления пароля.

## Основные функции

- 🔐 Регистрация новых пользователей
- ✅ Подтверждение email адреса через 6-значный код
- 🔑 Аутентификация пользователей с JWT токенами
- 🔄 Восстановление пароля через email
- 🔒 Безопасное хеширование паролей (bcrypt)
- 📧 Отправка email уведомлений

## Технологический стек

- **Framework**: FastAPI
- **ORM**: SQLAlchemy (синхронный)
- **База данных**: PostgreSQL
- **Аутентификация**: JWT (PyJWT)
- **Хеширование**: bcrypt
- **Валидация**: Pydantic

## Структура проекта

```
services/user-service/
├── main.py           # Точка входа приложения
├── models.py         # SQLAlchemy модели
├── crud.py           # CRUD операции с БД
├── routes.py         # API эндпоинты
├── auth.py           # Функции аутентификации и JWT
├── email_utils.py    # Утилиты для отправки email
├── config.py         # Конфигурация и БД сессия
├── db.py             # Инициализация базы данных
├── requirements.txt  # Python зависимости
├── Dockerfile        # Docker конфигурация
└── README.md         # Документация
```

## API Эндпоинты

### POST /users/register

Регистрация нового пользователя.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "User created. Check your email for confirmation code."
}
```

**Errors:**
- 400: Email уже зарегистрирован

### POST /users/confirm

Подтверждение email адреса пользователя.

**Request Body:**
```json
{
  "email": "ivan@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email confirmed"
}
```

**Errors:**
- 400: Неверный код подтверждения

### POST /users/login

Вход в систему.

**Request Body:**
```json
{
  "email": "ivan@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- 401: Неверные учетные данные
- 403: Email не подтвержден

### POST /users/recover

Запрос на восстановление пароля.

**Request Body:**
```json
{
  "email": "ivan@example.com"
}
```

**Response (200):**
```json
{
  "message": "Recovery code sent"
}
```

**Errors:**
- 404: Email не зарегистрирован

### POST /users/reset

Сброс пароля по коду восстановления.

**Request Body:**
```json
{
  "email": "ivan@example.com",
  "code": "123456",
  "new_password": "newsecurepassword456"
}
```

**Response (200):**
```json
{
  "message": "Password reset"
}
```

**Errors:**
- 400: Неверный код восстановления

## Модели данных

### User

```python
class User(Base):
    __tablename__ = 'users'
    
    id: int                        # Уникальный идентификатор
    name: str                      # Имя пользователя
    email: str                     # Email (уникальный)
    hashed_password: str           # Хешированный пароль
    confirmed: bool = False        # Подтвержден ли email
    confirmation_code: str | None  # Код подтверждения
    recovery_code: str | None      # Код восстановления
    is_admin: bool = False         # Администратор
    created_at: datetime           # Дата создания
```

## Аутентификация и безопасность

### JWT Токены

Сервис использует JWT токены для аутентификации:

```python
{
  "user_id": 123,
  "exp": 1234567890  # Время истечения
}
```

Секретный ключ настраивается через переменную окружения `SECRET_KEY`.

### Хеширование паролей

Пароли хешируются с использованием bcrypt перед сохранением в БД:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(password)
```

### Коды подтверждения

- 6-значные случайные числовые коды
- Отправляются на email пользователя
- Действительны до момента использования

## Переменные окружения

Создайте файл `.env` со следующими переменными:

```bash
# База данных
DATABASE_URL=postgresql://user:password@user-db:5432/user_db

# JWT секрет (обязательно измените в продакшене!)
SECRET_KEY=your-secret-key-change-in-production

# SMTP настройки для отправки email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email отправителя
FROM_EMAIL=noreply@coworking.com
```

## Установка и запуск

### Локальный запуск

1. Установите зависимости:
```bash
cd services/user-service
pip install -r requirements.txt
```

2. Настройте переменные окружения (см. выше)

3. Запустите сервис:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Сервис будет доступен на `http://localhost:8001`.

### Docker

```bash
docker build -t user-service .
docker run -p 8001:8001 --env-file .env user-service
```

### Docker Compose

Сервис автоматически запускается вместе с другими сервисами:

```bash
docker-compose up user-service
```

## Интеграция с другими сервисами

### API Gateway

API Gateway проксирует запросы к User Service:

```
/users/* → http://user-service:8001/users/*
```

### Notification Service

User Service отправляет запросы к Notification Service для отправки email:

```python
import requests

requests.post(
    "http://notification-service:8003/notify/email",
    json={
        "email": user.email,
        "subject": "Email Confirmation",
        "text": f"Your code: {code}"
    }
)
```

## Тестирование

### Ручное тестирование с curl

```bash
# Регистрация
curl -X POST http://localhost:8001/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Подтверждение (используйте код из email)
curl -X POST http://localhost:8001/users/confirm \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Вход
curl -X POST http://localhost:8001/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Интеграционные тесты

Рекомендуется добавить тесты с использованием pytest:

```bash
pytest tests/
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
┌─────────────────────┐         ┌──────────────────┐
│   User Service      │────────▶│ Notification     │
│                     │         │ Service          │
└──────┬──────────────┘         └──────────────────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │
│  (user_db)  │
└─────────────┘
```

## Миграции базы данных

База данных инициализируется автоматически при первом запуске через `db.py`:

```python
from models import Base
Base.metadata.create_all(bind=engine)
```

Для продакшена рекомендуется использовать Alembic для миграций.

## Логирование

Сервис использует стандартное логирование Python:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

## Мониторинг и метрики

- **Health check**: `GET /` возвращает `{"status": "ok"}`
- **Docs**: Swagger UI доступен на `/docs`
- **OpenAPI**: Схема доступна на `/openapi.json`

## Известные ограничения

- Синхронный ORM (SQLAlchemy) - для высоконагруженных систем рекомендуется async
- Email отправляется синхронно - может замедлить response time
- Коды подтверждения не имеют времени истечения
- Нет rate limiting для защиты от брутфорса

## Планы развития

- [ ] Переход на асинхронный SQLAlchemy
- [ ] Добавить rate limiting
- [ ] Реализовать refresh tokens
- [ ] Добавить OAuth2 (Google, GitHub)
- [ ] Внедрить Alembic для миграций
- [ ] Добавить время истечения для кодов
- [ ] Реализовать двухфакторную аутентификацию (2FA)
- [ ] Добавить логирование всех действий пользователей

## Безопасность

### Рекомендации для продакшена

1. **Измените SECRET_KEY** на случайную строку
2. **Используйте HTTPS** для всех соединений
3. **Настройте CORS** правильно в API Gateway
4. **Используйте переменные окружения** для всех секретов
5. **Настройте rate limiting** для защиты от атак
6. **Регулярно обновляйте** зависимости
7. **Используйте сильные пароли** для SMTP

## Troubleshooting

### Проблема: Email не отправляются

**Решение**: Проверьте SMTP настройки и убедитесь, что:
- SMTP_SERVER и SMTP_PORT корректны
- Используете App Password для Gmail
- Notification Service запущен и доступен

### Проблема: JWT токены не валидируются

**Решение**: Убедитесь, что SECRET_KEY одинаковый во всех сервисах.

### Проблема: Ошибки подключения к БД

**Решение**: Проверьте DATABASE_URL и что PostgreSQL запущен.

---

**Версия**: 1.0.0  
**Порт по умолчанию**: 8001  
**Документация API**: http://localhost:8001/docs
