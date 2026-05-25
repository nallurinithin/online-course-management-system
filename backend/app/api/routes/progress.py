from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_student
from app.schemas.course_schema import CourseProgressOut
from app.services import course_service

router = APIRouter(tags=["progress"])


@router.post("/lesson/{lesson_id}/complete", response_model=CourseProgressOut)
def mark_complete(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    progress = course_service.upsert_progress(db, current_user.id, lesson_id, is_completed=True)
    return progress


@router.post("/lesson/{lesson_id}/incomplete", response_model=CourseProgressOut)
def mark_incomplete(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    progress = course_service.upsert_progress(db, current_user.id, lesson_id, is_completed=False)
    return progress


@router.get("/course/{course_id}", response_model=list[CourseProgressOut])
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    return course_service.get_course_progress(db, current_user.id, course_id)


@router.get("/course/{course_id}/percentage")
def get_progress_percentage(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    return course_service.get_progress_percentage(db, current_user.id, course_id)
