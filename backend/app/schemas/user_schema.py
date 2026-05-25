from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student


class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    admin_secret: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: UserRole | None = None
    admin_secret: str | None = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
