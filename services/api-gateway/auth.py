import jwt
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import SECRET_KEY

http_bearer = HTTPBearer()

def get_current_user(request: Request):
    credentials: HTTPAuthorizationCredentials = http_bearer(request)
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, detail="Token expired")
    except Exception:
        raise HTTPException(401, detail="Invalid JWT token")