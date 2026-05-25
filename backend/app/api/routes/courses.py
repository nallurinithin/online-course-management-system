from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user, require_instructor
from app.schemas.course_schema import CourseCreate, CourseOut, CourseOutWithLessons
from app.schemas.user_schema import UserOut
from app.services import course_service

router = APIRouter(tags=["courses"])


@router.get("/", response_model=list[CourseOut])
def list_courses(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return course_service.get_all_courses(db, search=search)


@router.post("/", response_model=CourseOut)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    return course_service.create_course(db, data, instructor_id=current_user.id)


@router.get("/{course_id}", response_model=CourseOutWithLessons)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    course = course_service.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    course = course_service.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    return course_service.update_course(db, course, data)


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    course = course_service.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    course_service.delete_course(db, course_id)


@router.get("/{course_id}/students", response_model=list[UserOut])
def get_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    course = course_service.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    return course_service.get_course_students(db, course_id)
