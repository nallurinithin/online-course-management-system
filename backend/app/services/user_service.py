from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.user_schema import UserCreate, AdminCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    existing = get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed_pw = hash_password(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str, role: UserRole | None = None, admin_secret: str | None = None) -> User:
    user = get_user_by_email(db, email)
    
    # If role is not provided (e.g. from backend tests), default to user's actual database role
    if role is None:
        role = user.role if user else UserRole.student

    if not user or user.role != role:
        if role == UserRole.instructor:
            raise HTTPException(status_code=401, detail="instructor not registered please register first")
        else:
            raise HTTPException(status_code=401, detail="user not registered")

    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if role == UserRole.admin:
        from app.core.config import settings
        if admin_secret != settings.ADMIN_SECRET_KEY:
            raise HTTPException(status_code=401, detail="Invalid admin secret key")

    return user


def create_admin(db: Session, data: AdminCreate) -> User:
    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed_pw = hash_password(data.password)
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hashed_pw,
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, name: str) -> User:
    user.name = name
    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def delete_user(db: Session, user_id: int) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


def get_platform_stats(db: Session) -> dict:
    from app.models.user import UserRole
    total_users = db.query(User).filter(User.role != UserRole.admin).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
    }
