from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user, require_instructor
from app.schemas.course_schema import LessonCreate, LessonUpdate, LessonOut, LessonVideoUpdate
from app.services import course_service

router = APIRouter(tags=["lessons"])


@router.post("/", response_model=LessonOut)
def create_lesson(
    data: LessonCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    course = course_service.get_course_by_id(db, data.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    return course_service.create_lesson(db, data, course_id=data.course_id)


@router.get("/course/{course_id}", response_model=list[LessonOut])
def get_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return course_service.get_lessons_by_course(db, course_id)


@router.put("/{lesson_id}", response_model=LessonOut)
def update_lesson(
    lesson_id: int,
    data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    lesson = course_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    course = course_service.get_course_by_id(db, lesson.course_id)
    if not course or course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    return course_service.update_lesson(db, lesson, data)


@router.delete("/{lesson_id}", status_code=204)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    lesson = course_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    course = course_service.get_course_by_id(db, lesson.course_id)
    if not course or course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    course_service.delete_lesson(db, lesson_id)


@router.patch("/{lesson_id}/video", response_model=LessonOut)
def update_lesson_video(
    lesson_id: int,
    data: LessonVideoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    lesson = course_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    course = course_service.get_course_by_id(db, lesson.course_id)
    if not course or course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    return course_service.update_lesson_video(db, lesson, data.video_s3_key)
