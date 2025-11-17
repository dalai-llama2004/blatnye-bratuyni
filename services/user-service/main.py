from fastapi import FastAPI
from models import Base
from config import engine

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service")
