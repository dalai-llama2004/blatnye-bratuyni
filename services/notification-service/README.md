# Notification Service - Сервис уведомлений

## Обзор

Notification Service отвечает за отправку различных типов уведомлений пользователям системы бронирования коворкинга. В текущей версии поддерживается отправка email уведомлений через SMTP.

## Основные функции

- 📧 Отправка email уведомлений
- ✉️ Поддержка HTML и текстовых писем
- 🔄 Асинхронная обработка (планируется)
- 📊 Логирование отправленных уведомлений
- 🚀 Простой REST API

## Технологический стек

- **Framework**: FastAPI
- **Email**: smtplib (стандартная библиотека Python)
- **Валидация**: Pydantic
- **База данных**: PostgreSQL (для логирования)

## Структура проекта

```
services/notification-service/
├── src/
│   ├── main.py          # Точка входа приложения
│   ├── models.py        # SQLAlchemy модели (если используется БД)
│   ├── email_sender.py  # Логика отправки email
│   └── config.py        # Конфигурация
├── requirements.txt     # Python зависимости
├── Dockerfile          # Docker конфигурация
└── README.md           # Документация
```

## API Эндпоинты

### POST /notify/email

Отправить email уведомление.

**Request Body:**
```json
{
  "email": "user@example.com",
  "subject": "Подтверждение бронирования",
  "text": "Ваше бронирование подтверждено!",
  "html": "<p>Ваше <strong>бронирование</strong> подтверждено!</p>"
}
```

**Поля:**
- `email` (required): Email адрес получателя
- `subject` (required): Тема письма
- `text` (required): Текстовое содержание письма
- `html` (optional): HTML содержание письма

**Response (200):**
```json
{
  "status": "sent",
  "message": "Email sent successfully",
  "email": "user@example.com"
}
```

**Errors:**
- 400: Неверные данные запроса
- 500: Ошибка отправки email

### POST /notify/bulk (TODO)

Отправка массовых уведомлений.

**Request Body:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"],
  "subject": "Важное уведомление",
  "text": "Текст уведомления"
}
```

### POST /notify/internal (TODO)

Внутренние системные уведомления.

## Переменные окружения

```bash
# SMTP настройки
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true

# Учетные данные SMTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Email отправителя
FROM_EMAIL=noreply@coworking.com
FROM_NAME=Коворкинг Братюни

# База данных (опционально, для логирования)
DATABASE_URL=postgresql://notifier:password@notification-db:5432/notif_db

# Порт сервиса
PORT=8003
```

## SMTP конфигурация

### Gmail

1. Включите двухфакторную аутентификацию
2. Создайте App Password:
   - Перейдите в настройки Google Account
   - Security → 2-Step Verification → App passwords
   - Создайте пароль для "Mail"
3. Используйте этот пароль в `EMAIL_PASS`

```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Yandex

```bash
SMTP_SERVER=smtp.yandex.ru
SMTP_PORT=587
EMAIL_USER=your-email@yandex.ru
EMAIL_PASS=your-password
```

### Mail.ru

```bash
SMTP_SERVER=smtp.mail.ru
SMTP_PORT=587
EMAIL_USER=your-email@mail.ru
EMAIL_PASS=your-password
```

## Установка и запуск

### Локальный запуск

1. Установите зависимости:
```bash
cd services/notification-service
pip install -r requirements.txt
```

2. Создайте `.env` файл с SMTP настройками

3. Запустите сервис:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8003
```

Сервис будет доступен на `http://localhost:8003`.

### Docker

```bash
docker build -t notification-service .
docker run -p 8003:8003 --env-file .env notification-service
```

### Docker Compose

```bash
docker-compose up notification-service
```

## Использование в других сервисах

### User Service

Отправка кода подтверждения:

```python
import requests

response = requests.post(
    "http://notification-service:8003/notify/email",
    json={
        "email": "user@example.com",
        "subject": "Подтверждение email",
        "text": f"Ваш код подтверждения: {code}",
        "html": f"<h2>Ваш код подтверждения:</h2><p style='font-size: 24px;'><strong>{code}</strong></p>"
    }
)
```

Отправка кода восстановления пароля:

```python
requests.post(
    "http://notification-service:8003/notify/email",
    json={
        "email": user.email,
        "subject": "Восстановление пароля",
        "text": f"Ваш код восстановления: {recovery_code}",
        "html": f"""
        <h2>Восстановление пароля</h2>
        <p>Ваш код восстановления:</p>
        <p style='font-size: 24px;'><strong>{recovery_code}</strong></p>
        <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
        """
    }
)
```

### Booking Service

Уведомление о создании бронирования:

```python
requests.post(
    "http://notification-service:8003/notify/email",
    json={
        "email": user_email,
        "subject": "Бронирование подтверждено",
        "text": f"Ваше бронирование #{booking_id} подтверждено",
        "html": f"""
        <h2>Бронирование подтверждено</h2>
        <p>Номер бронирования: <strong>#{booking_id}</strong></p>
        <p>Время: {start_time} - {end_time}</p>
        <p>Место: {place_name}</p>
        """
    }
)
```

## Шаблоны писем

### Код подтверждения

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Подтверждение email</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0369a1;">Добро пожаловать в Коворкинг Братюни!</h2>
    <p>Ваш код подтверждения:</p>
    <div style="background-color: #e0f2fe; padding: 20px; text-align: center; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; color: #0369a1;">123456</span>
    </div>
    <p>Код действителен в течение 24 часов.</p>
</body>
</html>
```

### Подтверждение бронирования

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Бронирование подтверждено</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0369a1;">Бронирование подтверждено</h2>
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
        <p><strong>Номер бронирования:</strong> #123</p>
        <p><strong>Зона:</strong> Главный коворкинг</p>
        <p><strong>Место:</strong> A1</p>
        <p><strong>Дата:</strong> 15 января 2025</p>
        <p><strong>Время:</strong> 09:00 - 10:00</p>
    </div>
    <p>Спасибо за использование нашего сервиса!</p>
</body>
</html>
```

## Архитектура

```
┌──────────────────┐
│  User Service    │──┐
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ Booking Service  │──┼──▶ ┌─────────────────────┐
└──────────────────┘  │    │ Notification        │
                      │    │ Service             │
┌──────────────────┐  │    │                     │
│  Admin Service   │──┘    │ ┌─────────────────┐ │
└──────────────────┘       │ │ Email Sender    │ │──▶ SMTP
                           │ └─────────────────┘ │    Server
                           │ ┌─────────────────┐ │
                           │ │ Queue Handler   │ │
                           │ │ (TODO)          │ │
                           │ └─────────────────┘ │
                           └─────────────────────┘
                                     │
                                     ▼
                           ┌─────────────────┐
                           │  PostgreSQL     │
                           │  (notif_db)     │
                           │  Logs (TODO)    │
                           └─────────────────┘
```

## Логирование

Сервис логирует все отправленные уведомления:

```python
import logging

logger.info(f"Email sent to {email} with subject '{subject}'")
logger.error(f"Failed to send email to {email}: {error}")
```

Рекомендуется сохранять логи в базу данных для аудита.

## Очередь сообщений (TODO)

Для высоконагруженных систем рекомендуется использовать очередь:

### RabbitMQ

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('rabbitmq')
)
channel = connection.channel()
channel.queue_declare(queue='notifications')

# Отправка в очередь
channel.basic_publish(
    exchange='',
    routing_key='notifications',
    body=json.dumps(email_data)
)
```

### Celery

```python
from celery import Celery

app = Celery('notifications', broker='redis://localhost:6379')

@app.task
def send_email_task(email, subject, text):
    send_email(email, subject, text)
```

## Тестирование

### Ручное тестирование

```bash
curl -X POST http://localhost:8003/notify/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subject": "Test",
    "text": "This is a test email"
  }'
```

### Pytest

```python
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_send_email():
    response = client.post(
        "/notify/email",
        json={
            "email": "test@example.com",
            "subject": "Test",
            "text": "Test message"
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "sent"
```

## Мониторинг и метрики

Рекомендуемые метрики:

- Количество отправленных email
- Количество неудачных отправок
- Среднее время отправки
- Размер очереди (если используется)

## Известные ограничения

- Синхронная отправка email (может быть медленной)
- Нет retry логики при ошибках
- Нет rate limiting
- Нет шаблонизации писем
- Нет отслеживания доставки

## Планы развития

- [ ] Добавить RabbitMQ/Redis для очередей
- [ ] Реализовать retry механизм
- [ ] Добавить шаблоны писем (Jinja2)
- [ ] Логирование в базу данных
- [ ] Поддержка SMS уведомлений
- [ ] Поддержка Push уведомлений
- [ ] Массовые рассылки
- [ ] Статистика доставки
- [ ] Rate limiting
- [ ] Webhooks для событий доставки

## Безопасность

### Рекомендации

1. Используйте App Passwords вместо обычных паролей
2. Никогда не коммитьте `.env` файлы с паролями
3. Ограничьте доступ к сервису через firewall
4. Используйте TLS/SSL для SMTP соединений
5. Валидируйте email адреса
6. Добавьте rate limiting для предотвращения спама

### Валидация email

```python
import re

def is_valid_email(email: str) -> bool:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None
```

## Troubleshooting

### Проблема: Email не отправляются

**Решения:**
1. Проверьте SMTP настройки
2. Убедитесь, что используете App Password для Gmail
3. Проверьте firewall (порт 587 должен быть открыт)
4. Проверьте логи: `docker logs notification-service`

### Проблема: Slow performance

**Решение:** Используйте асинхронную очередь (RabbitMQ/Celery)

### Проблема: Too many connections

**Решение:** Используйте connection pool для SMTP

```python
from smtplib import SMTP
import threading

class SMTPPool:
    def __init__(self, max_connections=5):
        self.semaphore = threading.Semaphore(max_connections)
```

## Примеры использования

### Python

```python
import requests

def send_notification(email: str, subject: str, text: str):
    response = requests.post(
        "http://notification-service:8003/notify/email",
        json={
            "email": email,
            "subject": subject,
            "text": text
        }
    )
    return response.json()
```

### cURL

```bash
curl -X POST http://localhost:8003/notify/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "subject": "Hello",
    "text": "This is a test"
  }'
```

---

**Версия**: 1.0.0  
**Порт по умолчанию**: 8003  
**Документация API**: http://localhost:8003/docs