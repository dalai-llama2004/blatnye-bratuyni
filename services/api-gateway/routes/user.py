from fastapi import APIRouter, Request, Response
import requests
from config import USER_SERVICE_URL

router = APIRouter()

@router.post("/register")
async def register(request: Request):
    body = await request.json()
    resp = requests.post(f"{USER_SERVICE_URL}/register", json=body)
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type',"application/json"))

@router.post("/login")
async def login(request: Request):
    body = await request.json()
    resp = requests.post(f"{USER_SERVICE_URL}/login", json=body)
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type',"application/json"))

@router.post("/confirm")
async def confirm(request: Request):
    body = await request.json()
    resp = requests.post(f"{USER_SERVICE_URL}/confirm", json=body)
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type',"application/json"))