from fastapi import FastAPI
from routes import user, booking, notification

app = FastAPI(
    title="API Gateway",
    description="Единая точка входа для blatnye-bratuyni",
    version="1.0.0"
)

# Подключаем роуты, проксирующие бизнес-логику дальше
app.include_router(user.router, prefix="/users")
app.include_router(booking.router, prefix="/bookings")
app.include_router(notification.router, prefix="/notifications")

@app.get("/")
async def root():
    return {"status": "ok", "gateway": True}