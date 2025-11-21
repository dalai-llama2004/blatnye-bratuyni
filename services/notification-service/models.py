from pydantic import BaseModel, EmailStr

class EmailNotification(BaseModel):
    email: EmailStr
    subject: str
    text: str