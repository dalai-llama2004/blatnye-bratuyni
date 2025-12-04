# Database Service - База данных

## Обзор

Database Service предоставляет контейнеризированные PostgreSQL базы данных для всех микросервисов системы бронирования коворкинга. Каждый микросервис имеет собственную изолированную базу данных.

## Архитектура баз данных

Система использует подход "Database per Service" для обеспечения независимости микросервисов:

```
┌─────────────────┐     ┌──────────────────┐
│  User Service   │────▶│   user-db        │
│  (Port 8001)    │     │   (Port 5432)    │
└─────────────────┘     └──────────────────┘

┌─────────────────┐     ┌──────────────────┐
│ Booking Service │────▶│   booking-db     │
│  (Port 8002)    │     │   (Port 5433)    │
└─────────────────┘     └──────────────────┘

┌─────────────────┐     ┌──────────────────┐
│Notification Srv │────▶│  notification-db │
│  (Port 8003)    │     │   (Port 5434)    │
└─────────────────┘     └──────────────────┘
```

## Базы данных

### 1. user-db (User Service)

**Порт**: 5432  
**База данных**: user_db  
**Пользователь**: user  
**Пароль**: password

**Таблицы**:
- `users` - Пользователи системы

**Схема users**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_code VARCHAR(6),
    recovery_code VARCHAR(6),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_confirmed ON users(confirmed);
```

### 2. booking-db (Booking Service)

**Порт**: 5433 (маппится на внутренний 5432)  
**База данных**: booking_db  
**Пользователь**: booking_user  
**Пароль**: password

**Таблицы**:
- `zones` - Коворкинг-зоны
- `places` - Места в зонах
- `slots` - Временные слоты
- `bookings` - Бронирования

**Схема zones**:
```sql
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zones_is_active ON zones(is_active);
```

**Схема places**:
```sql
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_places_zone_id ON places(zone_id);
CREATE INDEX idx_places_is_active ON places(is_active);
```

**Схема slots**:
```sql
CREATE TABLE slots (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_slots_place_id ON slots(place_id);
CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_slots_is_available ON slots(is_available);
```

**Схема bookings**:
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
```

### 3. notification-db (Notification Service)

**Порт**: 5434 (маппится на внутренний 5432)  
**База данных**: notif_db  
**Пользователь**: notifier  
**Пароль**: password

**Таблицы**:
- `notifications` - Лог отправленных уведомлений (опционально)

**Схема notifications**:
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_email ON notifications(email);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## Docker Compose конфигурация

```yaml
services:
  user-db:
    image: postgres:16
    container_name: user-db
    environment:
      POSTGRES_DB: user_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - ./pgdata/user:/var/lib/postgresql/data
    restart: unless-stopped

  booking-db:
    image: postgres:16
    container_name: booking-db
    environment:
      POSTGRES_DB: booking_db
      POSTGRES_USER: booking_user
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - ./pgdata/booking:/var/lib/postgresql/data
    restart: unless-stopped

  notification-db:
    image: postgres:16
    container_name: notification-db
    environment:
      POSTGRES_DB: notif_db
      POSTGRES_USER: notifier
      POSTGRES_PASSWORD: password
    ports:
      - "5434:5432"
    volumes:
      - ./pgdata/notification:/var/lib/postgresql/data
    restart: unless-stopped
```

## Инициализация базы данных

### Автоматическая инициализация

Каждый микросервис автоматически создает свои таблицы при первом запуске через SQLAlchemy:

```python
from sqlalchemy import create_engine
from models import Base

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
```

### Ручная инициализация (init.sql)

Если используется `init.sql` файл для инициализации:

```sql
-- services/database/init.sql

-- User database
\c user_db;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_code VARCHAR(6),
    recovery_code VARCHAR(6),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking database
\c booking_db;

CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ... остальные таблицы
```

## Подключение к базам данных

### Из микросервисов (через Docker network)

```python
# User Service
DATABASE_URL = "postgresql://user:password@user-db:5432/user_db"

# Booking Service
DATABASE_URL = "postgresql+asyncpg://booking_user:password@booking-db:5432/booking_db"

# Notification Service
DATABASE_URL = "postgresql://notifier:password@notification-db:5432/notif_db"
```

### Локально (из хост машины)

```bash
# User DB
psql -h localhost -p 5432 -U user -d user_db

# Booking DB
psql -h localhost -p 5433 -U booking_user -d booking_db

# Notification DB
psql -h localhost -p 5434 -U notifier -d notif_db
```

### Через GUI клиенты

**pgAdmin / DBeaver / TablePlus**:

```
Host: localhost
Port: 5432 / 5433 / 5434
Database: user_db / booking_db / notif_db
Username: user / booking_user / notifier
Password: password
```

## Миграции

### Alembic (рекомендуется для продакшена)

Для каждого сервиса:

```bash
# Инициализация Alembic
cd services/user-service
alembic init alembic

# Создание миграции
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head

# Откат миграции
alembic downgrade -1
```

### Конфигурация Alembic

```python
# alembic/env.py
from models import Base
target_metadata = Base.metadata

def run_migrations_online():
    connectable = create_engine(DATABASE_URL)
    # ...
```

## Backup и Restore

### Backup всех баз данных

```bash
# User DB
docker exec user-db pg_dump -U user user_db > backup_user_db.sql

# Booking DB
docker exec booking-db pg_dump -U booking_user booking_db > backup_booking_db.sql

# Notification DB
docker exec notification-db pg_dump -U notifier notif_db > backup_notif_db.sql
```

### Restore из backup

```bash
# User DB
cat backup_user_db.sql | docker exec -i user-db psql -U user -d user_db

# Booking DB
cat backup_booking_db.sql | docker exec -i booking-db psql -U booking_user -d booking_db

# Notification DB
cat backup_notif_db.sql | docker exec -i notification-db psql -U notifier -d notif_db
```

### Автоматический backup (cron)

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

docker exec user-db pg_dump -U user user_db > "$BACKUP_DIR/user_db_$DATE.sql"
docker exec booking-db pg_dump -U booking_user booking_db > "$BACKUP_DIR/booking_db_$DATE.sql"
docker exec notification-db pg_dump -U notifier notif_db > "$BACKUP_DIR/notif_db_$DATE.sql"

# Удалить старые backup (старше 30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

Добавить в crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Мониторинг и производительность

### Подключение к БД

```bash
# Проверить активные подключения
docker exec user-db psql -U user -d user_db -c "SELECT count(*) FROM pg_stat_activity;"

# Просмотр активных запросов
docker exec user-db psql -U user -d user_db -c "SELECT pid, usename, state, query FROM pg_stat_activity WHERE state != 'idle';"
```

### Индексы

```sql
-- Проверить использование индексов
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Найти неиспользуемые индексы
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Размер БД

```sql
-- Размер каждой таблицы
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Общий размер БД
SELECT pg_size_pretty(pg_database_size('user_db'));
```

## Безопасность

### Рекомендации для продакшена

1. **Измените пароли по умолчанию**:
```yaml
environment:
  POSTGRES_PASSWORD: ${DB_PASSWORD}  # Из .env файла
```

2. **Ограничьте доступ по сети**:
```yaml
ports:
  - "127.0.0.1:5432:5432"  # Только localhost
```

3. **Используйте SSL/TLS** для подключений

4. **Регулярно обновляйте** PostgreSQL образ

5. **Настройте pg_hba.conf** для контроля доступа

6. **Включите логирование** для аудита

### SSL/TLS конфигурация

```yaml
user-db:
  image: postgres:16
  environment:
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - ./ssl/server.crt:/var/lib/postgresql/server.crt:ro
    - ./ssl/server.key:/var/lib/postgresql/server.key:ro
  command: >
    postgres
    -c ssl=on
    -c ssl_cert_file=/var/lib/postgresql/server.crt
    -c ssl_key_file=/var/lib/postgresql/server.key
```

## Оптимизация производительности

### PostgreSQL конфигурация

```yaml
user-db:
  image: postgres:16
  command:
    - postgres
    - -c
    - max_connections=100
    - -c
    - shared_buffers=256MB
    - -c
    - effective_cache_size=1GB
    - -c
    - maintenance_work_mem=64MB
    - -c
    - checkpoint_completion_target=0.9
    - -c
    - wal_buffers=16MB
    - -c
    - default_statistics_target=100
```

### Connection Pooling

Рекомендуется использовать PgBouncer:

```yaml
pgbouncer:
  image: edoburu/pgbouncer
  environment:
    DATABASE_URL: "postgres://user:password@user-db:5432/user_db"
    POOL_MODE: session
    MAX_CLIENT_CONN: 100
  ports:
    - "6432:5432"
```

## Очистка данных

### Удаление старых записей

```sql
-- Удалить старые уведомления (старше 90 дней)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Удалить отмененные бронирования (старше 30 дней)
DELETE FROM bookings 
WHERE status = 'cancelled' 
  AND updated_at < NOW() - INTERVAL '30 days';
```

### VACUUM

```bash
# Очистка и анализ всех таблиц
docker exec user-db psql -U user -d user_db -c "VACUUM ANALYZE;"
docker exec booking-db psql -U booking_user -d booking_db -c "VACUUM ANALYZE;"
```

## Тестовые данные

### Создание тестовых данных

```sql
-- User DB
INSERT INTO users (name, email, hashed_password, confirmed, is_admin)
VALUES 
    ('Admin User', 'admin@example.com', '$2b$12$...', true, true),
    ('Test User', 'test@example.com', '$2b$12$...', true, false);

-- Booking DB
INSERT INTO zones (name, address) VALUES
    ('Главный коворкинг', 'пр. Гагарина 15'),
    ('Филиал на Невском', 'Невский проспект 100');

INSERT INTO places (zone_id, name) VALUES
    (1, 'Место A1'),
    (1, 'Место A2'),
    (2, 'Место B1');

-- Создать слоты на неделю вперед
INSERT INTO slots (place_id, start_time, end_time)
SELECT 
    p.id,
    d.time,
    d.time + INTERVAL '1 hour'
FROM places p
CROSS JOIN generate_series(
    NOW()::date,
    NOW()::date + INTERVAL '7 days',
    INTERVAL '1 hour'
) AS d(time)
WHERE EXTRACT(HOUR FROM d.time) BETWEEN 9 AND 18;
```

## Troubleshooting

### Проблема: Cannot connect to database

**Решение**:
```bash
# Проверить, что контейнер запущен
docker ps | grep db

# Проверить логи
docker logs user-db

# Перезапустить контейнер
docker restart user-db
```

### Проблема: Permission denied

**Решение**: Проверить владельца директории volumes:
```bash
sudo chown -R 999:999 pgdata/
```

### Проблема: Slow queries

**Решение**: Добавить индексы и проанализировать запросы:
```sql
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = 123;
```

### Проблема: Disk space full

**Решение**: Очистить старые данные и выполнить VACUUM FULL:
```bash
docker exec user-db psql -U user -d user_db -c "VACUUM FULL;"
```

## Дополнительные инструменты

### pgAdmin

```yaml
pgadmin:
  image: dpage/pgadmin4
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
```

Доступен на http://localhost:5050

### Grafana + Prometheus

Для мониторинга метрик PostgreSQL:

```yaml
postgres_exporter:
  image: prometheuscommunity/postgres-exporter
  environment:
    DATA_SOURCE_NAME: "postgresql://user:password@user-db:5432/user_db?sslmode=disable"
  ports:
    - "9187:9187"
```

---

**PostgreSQL версия**: 16  
**Порты**: 5432 (user-db), 5433 (booking-db), 5434 (notification-db)  
**Хранилище**: ./pgdata/