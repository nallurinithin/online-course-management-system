from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_student
from app.schemas.course_schema import EnrollmentOut, CourseOut
from app.services import course_service

router = APIRouter(tags=["enrollments"])


class EnrollRequest(BaseModel):
    course_id: int


@router.post("/", response_model=EnrollmentOut)
def enroll(
    data: EnrollRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    enrollment = course_service.enroll_student(db, current_user.id, data.course_id)
    return enrollment


@router.get("/my-courses")
def get_my_courses(
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    enrollments = course_service.get_student_enrollments(db, current_user.id)
    result = []
    for enrollment in enrollments:
        course = enrollment.course
        result.append({
            "id": course.id,
            "enrollment_id": enrollment.id,
            "enrolled_at": enrollment.enrolled_at,
            "title": course.title,
            "description": course.description,
            "thumbnail_s3_key": course.thumbnail_s3_key,
            "thumbnail_url": course.thumbnail_url,
            "instructor_id": course.instructor_id,
            "instructor_name": course.instructor_name,
            "enrolled_count": course.enrolled_count,
            "lesson_count": course.lesson_count,
            "created_at": course.created_at,
            "is_completed": enrollment.is_completed,
        })
    return result


@router.patch("/{course_id}/complete", response_model=EnrollmentOut)
def complete_enrollment(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    from app.models.enrollment import Enrollment
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.is_completed = True
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.delete("/{course_id}", status_code=204)
def unenroll(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    from app.models.enrollment import Enrollment
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()
