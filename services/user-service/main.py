from fastapi import FastAPI
from models import Base
from config import engine
from routes import router

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service")
app.include_router(router)