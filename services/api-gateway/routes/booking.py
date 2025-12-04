from fastapi import APIRouter, Request, Depends, Response
import requests
from config import BOOKING_SERVICE_URL
from auth import get_current_user

router = APIRouter()

@router.get("/zones")
def get_zones():
    resp = requests.get(f"{BOOKING_SERVICE_URL}/zones")
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type',"application/json"))

@router.post("/")
async def create_booking(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    resp = requests.post(f"{BOOKING_SERVICE_URL}/bookings", json=body, headers={"Authorization": f"Bearer {user['sub']}"})
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type',"application/json"))

@router.post("/cancel")
async def cancel(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    resp = requests.post(f"{BOOKING_SERVICE_URL}/bookings/cancel", json=body, headers={"Authorization": f"Bearer {user['sub']}"})
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type',"application/json"))