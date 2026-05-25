from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.api.dependencies import get_db, require_admin
from app.schemas.user_schema import AdminCreate, UserOut
from app.services import user_service
from app.core.config import settings

router = APIRouter(tags=["admin"], include_in_schema=False)


@router.post("/register", response_model=UserOut)
def register_admin(
    data: AdminCreate,
    x_admin_secret: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    if x_admin_secret != settings.ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin secret key")
    user = user_service.create_admin(db, data)
    return user


@router.get("/users", response_model=list[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    from app.models.user import UserRole
    all_users = user_service.get_all_users(db, skip=skip, limit=limit)
    return [u for u in all_users if u.role != UserRole.admin]


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user_service.delete_user(db, user_id)


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return user_service.get_platform_stats(db)
