import smtplib
from email.message import EmailMessage
import random
import string
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

def generate_code(length=6):
    """Генератор 6-значного кода который будем присылать пользователю при
    регистрации/сброса пароля и др. случаем требования верификации"""
    return ''.join(random.choices(string.digits, k=length))

def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
