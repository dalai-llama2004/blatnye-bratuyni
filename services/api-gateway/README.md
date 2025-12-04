# API Gateway - Единая точка входа

## Обзор

API Gateway является единой точкой входа для всех клиентских запросов в системе бронирования коворкинга. Сервис отвечает за маршрутизацию запросов к микросервисам, обработку JWT авторизации и предоставление единого API интерфейса.

## Основные функции

- 🚪 Единая точка входа для всех API запросов
- 🔀 Маршрутизация запросов к микросервисам
- 🔐 Централизованная JWT авторизация
- 🛡️ CORS настройки для frontend
- 📊 Логирование всех запросов
- ⚡ Проксирование с минимальными задержками

## Технологический стек

- **Framework**: FastAPI
- **HTTP клиент**: requests (для проксирования)
- **Аутентификация**: JWT (PyJWT)
- **Валидация**: Pydantic

## Архитектура маршрутизации

```
┌──────────────┐
│   Frontend   │
│   (Port     │
│    3000)    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   API Gateway    │
│   (Port 8000)    │
│                  │
│  ┌────────────┐  │
│  │   Auth     │  │
│  │  Middleware│  │
│  └────────────┘  │
│  ┌────────────┐  │
│  │  Routing   │  │
│  └────────────┘  │
└──────┬───────────┘
       │
       ├─────────────────────────┬────────────────────────┐
       ▼                         ▼                        ▼
┌─────────────┐          ┌─────────────┐         ┌─────────────┐
│User Service │          │Booking Srv  │         │Notification │
│(Port 8001)  │          │(Port 8002)  │         │(Port 8003)  │
└─────────────┘          └─────────────┘         └─────────────┘
```

## Маршруты

### Публичные маршруты (без авторизации)

```
POST /users/register      → User Service
POST /users/confirm       → User Service
POST /users/login         → User Service
POST /users/recover       → User Service
POST /users/reset         → User Service
GET  /bookings/zones      → Booking Service
```

### Защищенные маршруты (требуют JWT токен)

```
POST   /bookings/                    → Booking Service
POST   /bookings/cancel              → Booking Service
GET    /bookings/bookings/history    → Booking Service
POST   /bookings/bookings/{id}/extend → Booking Service

# Admin маршруты (требуют is_admin=true)
POST   /bookings/admin/zones         → Booking Service
PATCH  /bookings/admin/zones/{id}    → Booking Service
DELETE /bookings/admin/zones/{id}    → Booking Service
POST   /bookings/admin/zones/{id}/close → Booking Service
```

## Структура проекта

```
services/api-gateway/
├── main.py              # Точка входа, FastAPI app
├── auth.py              # JWT middleware и проверка токенов
├── config.py            # Конфигурация и URL сервисов
├── routes/
│   ├── user.py         # Маршруты для User Service
│   ├── booking.py      # Маршруты для Booking Service
│   └── notification.py # Маршруты для Notification Service
├── requirements.txt     # Python зависимости
├── Dockerfile          # Docker конфигурация
└── README.md           # Документация
```

## Переменные окружения

```bash
# URLs микросервисов
USER_SERVICE_URL=http://user-service:8001
BOOKING_SERVICE_URL=http://booking-service:8002
NOTIFICATION_SERVICE_URL=http://notification-service:8003

# JWT секрет (должен совпадать с User Service)
SECRET_KEY=your-secret-key-change-in-production

# CORS настройки
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Порт API Gateway
PORT=8000
```

## Установка и запуск

### Локальный запуск

1. Установите зависимости:
```bash
cd services/api-gateway
pip install -r requirements.txt
```

2. Создайте `.env` файл с настройками

3. Убедитесь, что все микросервисы запущены

4. Запустите gateway:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API Gateway будет доступен на `http://localhost:8000`.

### Docker

```bash
docker build -t api-gateway .
docker run -p 8000:8000 --env-file .env api-gateway
```

### Docker Compose

```bash
docker-compose up api-gateway
```

## JWT Авторизация

### Механизм работы

1. Client отправляет запрос с заголовком `Authorization: Bearer <token>`
2. Gateway извлекает и декодирует токен
3. Проверяет валидность токена и срок действия
4. Извлекает `user_id` из токена
5. Проксирует запрос к нужному сервису

### Middleware

```python
from fastapi import Depends, HTTPException
from jose import jwt, JWTError

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split("Bearer ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Пример использования

```python
@router.post("/bookings/")
async def create_booking(
    request: Request, 
    user=Depends(get_current_user)  # Автоматическая проверка JWT
):
    body = await request.json()
    # Проксирование к Booking Service
    resp = requests.post(
        f"{BOOKING_SERVICE_URL}/bookings",
        json=body,
        headers={"Authorization": f"Bearer {user['sub']}"}
    )
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        media_type=resp.headers.get('content-type', 'application/json')
    )
```

## CORS конфигурация

API Gateway настроен для работы с frontend приложением:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "http://localhost:3001",  # Альтернативный порт
        # Добавьте продакшн домены
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Проксирование запросов

Gateway проксирует запросы к микросервисам с сохранением:
- HTTP метода (GET, POST, PATCH, DELETE)
- Тела запроса
- Заголовков (включая Authorization)
- Статус кода ответа
- Content-Type

```python
@router.post("/cancel")
async def cancel(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    resp = requests.post(
        f"{BOOKING_SERVICE_URL}/bookings/cancel",
        json=body,
        headers={"Authorization": f"Bearer {user['sub']}"}
    )
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        media_type=resp.headers.get('content-type', "application/json")
    )
```

## Обработка ошибок

### 401 Unauthorized

Возвращается когда:
- JWT токен отсутствует
- JWT токен невалиден
- JWT токен истек

### 403 Forbidden

Возвращается когда:
- У пользователя нет прав для операции
- Требуется is_admin=true, но пользователь не админ

### 404 Not Found

Возвращается когда:
- Маршрут не найден
- Микросервис вернул 404

### 500 Internal Server Error

Возвращается когда:
- Микросервис недоступен
- Ошибка проксирования

## Логирование

```python
import logging

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

## Health Check

```python
@app.get("/health")
def health_check():
    # Проверить доступность микросервисов
    services = {
        "user_service": check_service(USER_SERVICE_URL),
        "booking_service": check_service(BOOKING_SERVICE_URL),
        "notification_service": check_service(NOTIFICATION_SERVICE_URL)
    }
    
    all_healthy = all(services.values())
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "services": services
    }
```

## Rate Limiting (рекомендуется)

Для защиты от DDoS атак:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/users/login")
@limiter.limit("5/minute")  # 5 попыток в минуту
def login(request: Request):
    # ...
```

## Кэширование (рекомендуется)

Для уменьшения нагрузки на микросервисы:

```python
from functools import lru_cache
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0)

@app.get("/bookings/zones")
async def get_zones():
    # Проверить кэш
    cached = redis_client.get("zones")
    if cached:
        return json.loads(cached)
    
    # Запросить у сервиса
    resp = requests.get(f"{BOOKING_SERVICE_URL}/zones")
    
    # Сохранить в кэш на 5 минут
    redis_client.setex("zones", 300, resp.content)
    
    return Response(content=resp.content, ...)
```

## Мониторинг и метрики

Рекомендуемые метрики:

- Количество запросов по эндпоинтам
- Время ответа каждого микросервиса
- Количество ошибок 4xx и 5xx
- Количество активных соединений
- Использование памяти и CPU

### Prometheus интеграция

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

## Тестирование

### Ручное тестирование

```bash
# Публичный эндпоинт
curl http://localhost:8000/bookings/zones

# Защищенный эндпоинт
curl http://localhost:8000/bookings/ \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

### Интеграционные тесты

```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_login():
    response = client.post(
        "/users/login",
        json={"email": "test@example.com", "password": "password"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

## Безопасность

### Best Practices

1. **Используйте HTTPS** в продакшене
2. **Валидируйте JWT токены** на каждом защищенном эндпоинте
3. **Настройте CORS** только для доверенных доменов
4. **Добавьте rate limiting** для защиты от атак
5. **Логируйте подозрительную активность**
6. **Используйте сильный SECRET_KEY**
7. **Регулярно обновляйте зависимости**

### Security Headers

```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

## Известные ограничения

- Синхронное проксирование (блокирующие запросы)
- Нет retry логики при недоступности сервисов
- Нет circuit breaker паттерна
- Нет кэширования ответов
- Нет rate limiting out-of-the-box

## Планы развития

- [ ] Переход на асинхронные HTTP клиенты (httpx)
- [ ] Добавить Circuit Breaker для fault tolerance
- [ ] Реализовать retry логику
- [ ] Добавить Redis для кэширования
- [ ] Интегрировать rate limiting
- [ ] Добавить request/response validation
- [ ] Реализовать API versioning
- [ ] Добавить GraphQL gateway
- [ ] Метрики и трейсинг (Prometheus, Jaeger)

## Troubleshooting

### Проблема: CORS ошибки в браузере

**Решение**: Добавьте frontend URL в ALLOWED_ORIGINS:
```python
allow_origins=["http://localhost:3000"]
```

### Проблема: 502 Bad Gateway

**Решение**: Проверьте:
- Запущены ли микросервисы
- Правильные ли URLs в config.py
- Доступны ли сервисы по сети

### Проблема: JWT токены не валидируются

**Решение**: SECRET_KEY должен быть одинаковым в User Service и API Gateway.

### Проблема: Медленные ответы

**Решение**: 
- Используйте асинхронные HTTP клиенты
- Добавьте кэширование
- Оптимизируйте микросервисы

## Примеры использования

### cURL

```bash
# Получить список зон
curl http://localhost:8000/bookings/zones

# Создать бронирование
TOKEN="your-jwt-token"
curl -X POST http://localhost:8000/bookings/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Добавить токен к каждому запросу
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Создать бронирование
const booking = await api.post('/bookings/', { slot_id: 1 });
```

---

**Версия**: 1.0.0  
**Порт по умолчанию**: 8000  
**Документация API**: http://localhost:8000/docs