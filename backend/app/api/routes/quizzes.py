from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user, require_instructor, require_student
from app.models.user import UserRole
from app.schemas.quiz_schema import (
    QuizCreate,
    QuizOut,
    QuizOutInstructor,
    QuizAttemptCreate,
    QuizAttemptOut,
)
from app.services import quiz_service

router = APIRouter(tags=["quizzes"])


@router.post("/", response_model=QuizOutInstructor)
def create_quiz(
    data: QuizCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    quiz = quiz_service.create_quiz(db, data, instructor_id=current_user.id)
    return quiz


@router.get("/lesson/{lesson_id}")
def get_quiz_for_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = quiz_service.get_quiz_by_lesson(db, lesson_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found for this lesson")
    if current_user.role == UserRole.instructor:
        return QuizOutInstructor.model_validate(quiz)
    return QuizOut.model_validate(quiz)


@router.post("/{quiz_id}/attempt", response_model=QuizAttemptOut)
def submit_attempt(
    quiz_id: int,
    data: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    if data.quiz_id != quiz_id:
        raise HTTPException(status_code=400, detail="quiz_id in body does not match URL")
    attempt = quiz_service.submit_attempt(db, current_user.id, quiz_id, data.answers)
    return attempt


@router.get("/{quiz_id}/my-result", response_model=QuizAttemptOut)
def get_my_result(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_student),
):
    attempt = quiz_service.get_student_attempt(db, current_user.id, quiz_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="No attempt found for this quiz")
    return attempt


@router.get("/{quiz_id}/all-results", response_model=list[QuizAttemptOut])
def get_all_results(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor),
):
    quiz = quiz_service.get_quiz_by_id(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz_service.get_all_attempts(db, quiz_id)
