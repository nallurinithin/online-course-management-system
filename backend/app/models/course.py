from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    thumbnail_s3_key = Column(String, nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    instructor = relationship("User", back_populates="courses")
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.order_index")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")

    @property
    def thumbnail_url(self) -> Optional[str]:
        if not self.thumbnail_s3_key:
            return None
        from app.core.s3 import get_presigned_view_url
        try:
            return get_presigned_view_url(self.thumbnail_s3_key)
        except Exception:
            return None

    @property
    def instructor_name(self) -> str:
        return self.instructor.name if self.instructor else "Instructor"

    @property
    def enrolled_count(self) -> int:
        return len(self.enrollments) if self.enrollments else 0

    @property
    def lesson_count(self) -> int:
        return len(self.lessons) if self.lessons else 0


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    video_s3_key = Column(String, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    course = relationship("Course", back_populates="lessons")
    progress = relationship("Progress", back_populates="lesson", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
