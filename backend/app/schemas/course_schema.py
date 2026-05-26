from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user_schema import UserOut


class CourseCreate(BaseModel):
    title: str
    description: str
    thumbnail_s3_key: Optional[str] = None


class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    thumbnail_s3_key: Optional[str] = None
    instructor_id: int
    created_at: datetime
    instructor: UserOut
    thumbnail_url: Optional[str] = None
    instructor_name: Optional[str] = None
    enrolled_count: int = 0
    lesson_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CourseOutWithLessons(CourseOut):
    lessons: list["LessonOut"] = []

    model_config = ConfigDict(from_attributes=True)


class LessonCreate(BaseModel):
    course_id: int
    title: str
    order_index: int = 0


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    order_index: Optional[int] = None


class LessonVideoUpdate(BaseModel):
    video_s3_key: str


class LessonOut(BaseModel):
    id: int
    course_id: int
    title: str
    video_s3_key: Optional[str] = None
    order_index: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    is_completed: bool = False
    enrolled_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProgressUpdate(BaseModel):
    lesson_id: int
    is_completed: bool


class CourseProgressOut(BaseModel):
    lesson_id: int
    is_completed: bool
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class S3UploadRequest(BaseModel):
    filename: str
    content_type: str
    s3_prefix: str


class S3UploadResponse(BaseModel):
    upload_url: str
    s3_key: str


CourseOutWithLessons.model_rebuild()
