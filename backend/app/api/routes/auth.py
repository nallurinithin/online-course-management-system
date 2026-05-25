from datetime import timedelta
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user
from app.core.security import create_access_token, set_auth_cookie, clear_auth_cookie
from app.schemas.user_schema import UserCreate, UserLogin, UserOut
from app.services import user_service
from app.core.config import settings

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = user_service.create_user(db, user_data)
    return user


@router.post("/login", response_model=UserOut)
def login(response: Response, credentials: UserLogin, db: Session = Depends(get_db)):
    user = user_service.authenticate_user(
        db, 
        credentials.email, 
        credentials.password, 
        credentials.role, 
        credentials.admin_secret
    )
    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    set_auth_cookie(response, token)
    return user


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user
