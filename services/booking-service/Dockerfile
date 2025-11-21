# services/booking-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY app ./app

# Запускаем сервис
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
