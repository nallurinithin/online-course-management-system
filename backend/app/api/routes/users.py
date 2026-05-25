from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.api.dependencies import get_db, get_current_user
from app.schemas.user_schema import UserOut
from app.services import user_service

router = APIRouter(tags=["users"])


class UserUpdateRequest(BaseModel):
    name: str


@router.get("/me", response_model=UserOut)
def get_profile(current_user=Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    update_data: UserUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_user = user_service.update_user(db, current_user, update_data.name)
    return updated_user
