from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from app.models.course import Course, Lesson
from app.models.enrollment import Enrollment, Progress
from app.models.user import User
from app.schemas.course_schema import CourseCreate, LessonCreate, LessonUpdate


def create_course(db: Session, data: CourseCreate, instructor_id: int) -> Course:
    course = Course(
        title=data.title,
        description=data.description,
        instructor_id=instructor_id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    # Load instructor relationship
    db.refresh(course)
    course = (
        db.query(Course)
        .options(joinedload(Course.instructor))
        .filter(Course.id == course.id)
        .first()
    )
    return course


def get_all_courses(db: Session, search: str | None = None) -> list[Course]:
    query = db.query(Course).options(joinedload(Course.instructor))
    if search:
        query = query.filter(
            Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%")
        )
    return query.all()


def get_course_by_id(db: Session, course_id: int) -> Course | None:
    return (
        db.query(Course)
        .options(joinedload(Course.instructor), joinedload(Course.lessons))
        .filter(Course.id == course_id)
        .first()
    )


def update_course(db: Session, course: Course, data: CourseCreate) -> Course:
    course.title = data.title
    course.description = data.description
    db.commit()
    db.refresh(course)
    course = (
        db.query(Course)
        .options(joinedload(Course.instructor))
        .filter(Course.id == course.id)
        .first()
    )
    return course


def delete_course(db: Session, course_id: int) -> None:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


def create_lesson(db: Session, data: LessonCreate, course_id: int) -> Lesson:
    lesson = Lesson(
        course_id=course_id,
        title=data.title,
        order_index=data.order_index,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def get_lessons_by_course(db: Session, course_id: int) -> list[Lesson]:
    return (
        db.query(Lesson)
        .filter(Lesson.course_id == course_id)
        .order_by(Lesson.order_index)
        .all()
    )


def get_lesson_by_id(db: Session, lesson_id: int) -> Lesson | None:
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()


def update_lesson(db: Session, lesson: Lesson, data: LessonUpdate) -> Lesson:
    if data.title is not None:
        lesson.title = data.title
    if data.order_index is not None:
        lesson.order_index = data.order_index
    db.commit()
    db.refresh(lesson)
    return lesson


def update_lesson_video(db: Session, lesson: Lesson, video_s3_key: str) -> Lesson:
    lesson.video_s3_key = video_s3_key
    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson_id: int) -> None:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()


def enroll_student(db: Session, student_id: int, course_id: int) -> Enrollment:
    existing = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled in this course")
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollment = Enrollment(student_id=student_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def get_student_enrollments(db: Session, student_id: int) -> list[Enrollment]:
    return (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course).joinedload(Course.instructor))
        .filter(Enrollment.student_id == student_id)
        .all()
    )


def get_course_students(db: Session, course_id: int) -> list[User]:
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    student_ids = [e.student_id for e in enrollments]
    return db.query(User).filter(User.id.in_(student_ids)).all()


def upsert_progress(
    db: Session, student_id: int, lesson_id: int, is_completed: bool
) -> Progress:
    progress = (
        db.query(Progress)
        .filter(Progress.student_id == student_id, Progress.lesson_id == lesson_id)
        .first()
    )
    now = datetime.now(timezone.utc)
    if progress:
        progress.is_completed = is_completed
        progress.completed_at = now if is_completed else None
    else:
        progress = Progress(
            student_id=student_id,
            lesson_id=lesson_id,
            is_completed=is_completed,
            completed_at=now if is_completed else None,
        )
        db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


def get_course_progress(db: Session, student_id: int, course_id: int) -> list[Progress]:
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    lesson_ids = [l.id for l in lessons]
    return (
        db.query(Progress)
        .filter(Progress.student_id == student_id, Progress.lesson_id.in_(lesson_ids))
        .all()
    )


def get_progress_percentage(db: Session, student_id: int, course_id: int) -> dict:
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    total = len(lessons)
    if total == 0:
        return {"percentage": 0.0, "completed": 0, "total": 0}
    lesson_ids = [l.id for l in lessons]
    completed = (
        db.query(Progress)
        .filter(
            Progress.student_id == student_id,
            Progress.lesson_id.in_(lesson_ids),
            Progress.is_completed == True,
        )
        .count()
    )
    percentage = round((completed / total) * 100, 2)
    return {"percentage": percentage, "completed": completed, "total": total}
