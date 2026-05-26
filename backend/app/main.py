from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.core.config import settings
from app.api.routes import auth, admin, users, courses, lessons, uploads, enrollments, progress, quizzes, mock_s3


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Seed default admin
    from app.core.database import SessionLocal
    from app.services.user_service import get_user_by_email, create_admin
    from app.schemas.user_schema import AdminCreate
    
    db = SessionLocal()
    try:
        admin_email = settings.ADMIN_DEFAULT_EMAIL
        if admin_email and not get_user_by_email(db, admin_email):
            admin_data = AdminCreate(
                name="System Admin",
                email=admin_email,
                password=settings.ADMIN_DEFAULT_PASSWORD,
                admin_secret=settings.ADMIN_SECRET_KEY
            )
            create_admin(db, admin_data)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Online Course Management System",
    description="A full-featured course management platform with JWT cookie auth",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,  # CRITICAL for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(users.router, prefix="/api/users")
app.include_router(courses.router, prefix="/api/courses")
app.include_router(lessons.router, prefix="/api/lessons")
app.include_router(uploads.router, prefix="/api/uploads")
app.include_router(enrollments.router, prefix="/api/enrollments")
app.include_router(progress.router, prefix="/api/progress")
app.include_router(quizzes.router, prefix="/api/quizzes")
app.include_router(mock_s3.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Online Course Management System"}
