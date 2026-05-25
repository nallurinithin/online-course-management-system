from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.models.course import Lesson, Course
from app.schemas.quiz_schema import QuizCreate


def create_quiz(db: Session, data: QuizCreate, instructor_id: int) -> Quiz:
    lesson = db.query(Lesson).filter(Lesson.id == data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    course = db.query(Course).filter(Course.id == lesson.course_id).first()
    if not course or course.instructor_id != instructor_id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    existing_quiz = db.query(Quiz).filter(Quiz.lesson_id == data.lesson_id).first()
    if existing_quiz:
        raise HTTPException(status_code=409, detail="Quiz already exists for this lesson")
    quiz = Quiz(lesson_id=data.lesson_id, title=data.title)
    db.add(quiz)
    db.flush()
    for q in data.questions:
        question = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option,
            order_index=q.order_index,
        )
        db.add(question)
    db.commit()
    db.refresh(quiz)
    return quiz


def get_quiz_by_lesson(db: Session, lesson_id: int) -> Quiz | None:
    return db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()


def get_quiz_by_id(db: Session, quiz_id: int) -> Quiz | None:
    return db.query(Quiz).filter(Quiz.id == quiz_id).first()


def submit_attempt(
    db: Session, student_id: int, quiz_id: int, answers: dict
) -> QuizAttempt:
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = (
        db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    )
    if not questions:
        raise HTTPException(status_code=400, detail="Quiz has no questions")
    correct_count = 0
    for question in questions:
        student_answer = answers.get(question.id)
        if student_answer and student_answer.lower() == question.correct_option.value:
            correct_count += 1
    score = round((correct_count / len(questions)) * 100, 2)
    passed = score >= 70.0
    existing_attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.student_id == student_id,
            QuizAttempt.quiz_id == quiz_id,
        )
        .first()
    )
    now = datetime.now(timezone.utc)
    if existing_attempt:
        existing_attempt.score = score
        existing_attempt.passed = passed
        existing_attempt.attempted_at = now
        db.commit()
        db.refresh(existing_attempt)
        return existing_attempt
    attempt = QuizAttempt(
        student_id=student_id,
        quiz_id=quiz_id,
        score=score,
        passed=passed,
        attempted_at=now,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def get_student_attempt(db: Session, student_id: int, quiz_id: int) -> QuizAttempt | None:
    return (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.student_id == student_id,
            QuizAttempt.quiz_id == quiz_id,
        )
        .first()
    )


def get_all_attempts(db: Session, quiz_id: int) -> list[QuizAttempt]:
    return db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id).all()
