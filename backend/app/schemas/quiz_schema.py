from datetime import datetime
from typing import Optional
import enum
from pydantic import BaseModel, ConfigDict


class AnswerOptionEnum(str, enum.Enum):
    a = "a"
    b = "b"
    c = "c"
    d = "d"


class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: AnswerOptionEnum
    order_index: int = 0


class QuestionOut(BaseModel):
    id: int
    quiz_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class QuestionOutInstructor(QuestionOut):
    correct_option: AnswerOptionEnum

    model_config = ConfigDict(from_attributes=True)


class QuizCreate(BaseModel):
    lesson_id: int
    title: str
    questions: list[QuestionCreate]


class QuizOut(BaseModel):
    id: int
    lesson_id: int
    title: str
    questions: list[QuestionOut]

    model_config = ConfigDict(from_attributes=True)


class QuizOutInstructor(BaseModel):
    id: int
    lesson_id: int
    title: str
    questions: list[QuestionOutInstructor]

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptCreate(BaseModel):
    quiz_id: int
    answers: dict[int, str]  # question_id -> answer 'a'/'b'/'c'/'d'


class QuizAttemptOut(BaseModel):
    id: int
    quiz_id: int
    score: float
    passed: bool
    attempted_at: datetime

    model_config = ConfigDict(from_attributes=True)
