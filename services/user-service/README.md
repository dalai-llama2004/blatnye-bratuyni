# User Service

## Назначение

Сервис отвечает за управление пользователями в системе бронирования рабочей среды. Он обеспечивает регистрацию, подтверждение email, авторизацию, генерацию JWT токенов и восстановление пароля. Сервис взаимодействует с собственной базой данных и используется другими компонентами системы через API Gateway.

## Основные возможности

- Регистрация пользователя
- Отправка кода подтверждения email
- Подтверждение аккаунта
- Авторизация и выдача JWT
- Генерация кода восстановления
- Сброс пароля
- Работа с PostgreSQL через SQLAlchemy
- Возможность контейнеризации с Docker

## Архитектура

User Service является частью микросервисной системы.

- Принимает запросы через API Gateway
- Хранит данные в базе UserDB
- Использует SMTP сервер для отправки писем
- Формирует JWT токены для авторизации

## Используемые технологии

- Python 3.12
- FastAPI
- PostgreSQL
- SQLAlchemy
- Passlib
- python-jose
- SMTP
- Docker, Uvicorn

## Структура проекта

```md
user-service/
├── main.py
├── models.py
├── crud.py
├── routes.py
├── auth.py
├── email_utils.py
├── config.py
├── requirements.txt
├── Dockerfile
└── README.md
```

## Установка и запуск

### 1. Установка зависимостей

```python
pip install -r requirements.txt
```

### 2. Настройка окружения

Создайте файл `.env` и укажите параметры:

```text
DB_URL=postgresql://postgres:postgres@localhost:5432/userservice

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

SECRET_KEY=supersecretkey
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Запуск сервиса

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000
```

Сервис будет доступен по адресу:
<http://localhost:8000>

### 4. Документация API

FastAPI предоставляет автоматическую документацию:

- Swagger UI: <http://localhost:8000/docs>
- Redoc: <http://localhost:8000/redoc>

## Docker

### Сборка образа

```powershell
docker build -t user-service .
```

### Запуск контейнера

```powershell
docker run -p 8000:8000 --env-file .env user-service
```

## API Endpoints

### Регистрация пользователя

```json
POST /users/register
{
  "name": "John",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Подтверждение email

```json
POST /users/confirm
{
  "email": "john@example.com",
  "code": "123456"
}
```

### Авторизация

```json
POST /users/login
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Ответ:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

### Восстановление пароля

```json
POST /users/recover
{
  "email": "john@example.com"
}
```

### Сброс пароля

```json
POST /users/reset
{
  "email": "john@example.com",
  "code": "123456",
  "new_password": "newpass123"
}
```

## Структура базы данных

### Таблица users

| Поле               | Тип      | Описание |
|-------------------|----------|----------|
| id                | int      | PK |
| name              | string   | Имя |
| email             | string   | Уникальный email |
| hashed_password   | string   | Хеш пароля |
| confirmed         | boolean  | Статус подтверждения |
| confirmation_code | string   | Код подтверждения |
| recovery_code     | string   | Код восстановления |
| created_at        | datetime | Дата создания |

## Безопасность

- Хеширование паролей через Passlib (pbkdf2_sha256)
- JWT подпись через SECRET_KEY
- Обязательное подтверждение email
- Одноразовые коды подтверждения и восстановления