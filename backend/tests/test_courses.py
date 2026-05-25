import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base
from app.api.dependencies import get_db

TEST_DATABASE_URL = "sqlite:///./test_courses.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=True)


# ── Helpers ────────────────────────────────────────────────────────────────────

def register_and_login(client: TestClient, name: str, email: str, password: str, role: str):
    client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password, "role": role},
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert resp.status_code == 200
    return resp.json()


# ── Course CRUD ────────────────────────────────────────────────────────────────

def test_instructor_can_create_course(client: TestClient):
    register_and_login(client, "Instructor1", "inst1@example.com", "pw", "instructor")
    resp = client.post(
        "/api/courses/",
        json={"title": "Python Basics", "description": "Learn Python"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Python Basics"
    assert data["instructor"]["email"] == "inst1@example.com"


def test_student_cannot_create_course(client: TestClient):
    register_and_login(client, "Student1", "stu1@example.com", "pw", "student")
    resp = client.post(
        "/api/courses/",
        json={"title": "Bad Course", "description": "Should fail"},
    )
    assert resp.status_code == 403


def test_anyone_can_list_courses(client: TestClient):
    # Create a course as instructor
    register_and_login(client, "Instructor2", "inst2@example.com", "pw", "instructor")
    client.post("/api/courses/", json={"title": "Course A", "description": "Desc A"})
    # Log out
    client.post("/api/auth/logout")
    # List without auth — should still succeed (public endpoint)
    resp = client.get("/api/courses/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_search_courses(client: TestClient):
    register_and_login(client, "Instructor3", "inst3@example.com", "pw", "instructor")
    client.post("/api/courses/", json={"title": "FastAPI Deep Dive", "description": "Advanced FastAPI"})
    client.post("/api/courses/", json={"title": "Django Basics", "description": "Learn Django"})
    resp = client.get("/api/courses/?search=FastAPI")
    assert resp.status_code == 200
    results = resp.json()
    assert all("FastAPI" in c["title"] or "FastAPI" in c["description"] for c in results)


# ── Enrollment ─────────────────────────────────────────────────────────────────

def test_student_can_enroll(client: TestClient):
    register_and_login(client, "InstructorE", "inste@example.com", "pw", "instructor")
    course_resp = client.post(
        "/api/courses/",
        json={"title": "Enroll Course", "description": "For enrollment test"},
    )
    course_id = course_resp.json()["id"]
    client.post("/api/auth/logout")

    register_and_login(client, "StudentE", "stue@example.com", "pw", "student")
    enroll_resp = client.post("/api/enrollments/", json={"course_id": course_id})
    assert enroll_resp.status_code == 200
    assert enroll_resp.json()["course_id"] == course_id


def test_student_cannot_enroll_twice(client: TestClient):
    register_and_login(client, "InstructorD", "instd@example.com", "pw", "instructor")
    course_resp = client.post(
        "/api/courses/",
        json={"title": "Double Enroll Course", "description": "Test double enrollment"},
    )
    course_id = course_resp.json()["id"]
    client.post("/api/auth/logout")

    register_and_login(client, "StudentD", "stud@example.com", "pw", "student")
    client.post("/api/enrollments/", json={"course_id": course_id})
    second_resp = client.post("/api/enrollments/", json={"course_id": course_id})
    assert second_resp.status_code == 409


# ── Lessons ────────────────────────────────────────────────────────────────────

def test_instructor_can_create_lesson(client: TestClient):
    register_and_login(client, "InstructorL", "instl@example.com", "pw", "instructor")
    course_resp = client.post(
        "/api/courses/",
        json={"title": "Lesson Course", "description": "For lesson test"},
    )
    course_id = course_resp.json()["id"]
    lesson_resp = client.post(
        "/api/lessons/",
        json={"course_id": course_id, "title": "Intro Lesson", "order_index": 0},
    )
    assert lesson_resp.status_code == 200
    assert lesson_resp.json()["title"] == "Intro Lesson"


# ── Quiz ───────────────────────────────────────────────────────────────────────

def _setup_quiz(client: TestClient):
    """Returns (course_id, lesson_id, quiz_id) after instructor creates everything."""
    register_and_login(client, "InstructorQ", "instq@example.com", "pw", "instructor")
    course_resp = client.post(
        "/api/courses/",
        json={"title": "Quiz Course", "description": "For quiz test"},
    )
    course_id = course_resp.json()["id"]
    lesson_resp = client.post(
        "/api/lessons/",
        json={"course_id": course_id, "title": "Quiz Lesson", "order_index": 0},
    )
    lesson_id = lesson_resp.json()["id"]
    quiz_resp = client.post(
        "/api/quizzes/",
        json={
            "lesson_id": lesson_id,
            "title": "Python Quiz",
            "questions": [
                {
                    "question_text": "What is 2+2?",
                    "option_a": "3",
                    "option_b": "4",
                    "option_c": "5",
                    "option_d": "6",
                    "correct_option": "b",
                    "order_index": 0,
                },
                {
                    "question_text": "Capital of France?",
                    "option_a": "London",
                    "option_b": "Berlin",
                    "option_c": "Paris",
                    "option_d": "Rome",
                    "correct_option": "c",
                    "order_index": 1,
                },
            ],
        },
    )
    assert quiz_resp.status_code == 200
    quiz_id = quiz_resp.json()["id"]
    return course_id, lesson_id, quiz_id


def test_instructor_can_create_quiz(client: TestClient):
    _, _, quiz_id = _setup_quiz(client)
    assert quiz_id is not None


def test_student_can_submit_quiz_and_get_score(client: TestClient):
    course_id, lesson_id, quiz_id = _setup_quiz(client)
    client.post("/api/auth/logout")

    # Register and login as student, enroll in course
    register_and_login(client, "StudentQ", "stuq@example.com", "pw", "student")
    client.post("/api/enrollments/", json={"course_id": course_id})

    # Get quiz (student view — no correct_option)
    quiz_view = client.get(f"/api/quizzes/lesson/{lesson_id}")
    assert quiz_view.status_code == 200
    questions = quiz_view.json()["questions"]
    assert all("correct_option" not in q for q in questions)

    # Submit attempt — answer both correctly
    q_ids = [q["id"] for q in questions]
    # We need to know which question IDs map to which correct answer.
    # From _setup_quiz: first question correct=b, second correct=c
    answers = {str(q_ids[0]): "b", str(q_ids[1]): "c"}
    attempt_resp = client.post(
        f"/api/quizzes/{quiz_id}/attempt",
        json={"quiz_id": quiz_id, "answers": answers},
    )
    assert attempt_resp.status_code == 200
    result = attempt_resp.json()
    assert result["score"] == 100.0
    assert result["passed"] is True


def test_quiz_partial_score(client: TestClient):
    course_id, lesson_id, quiz_id = _setup_quiz(client)
    client.post("/api/auth/logout")

    register_and_login(client, "StudentP", "stup@example.com", "pw", "student")
    client.post("/api/enrollments/", json={"course_id": course_id})

    quiz_view = client.get(f"/api/quizzes/lesson/{lesson_id}")
    questions = quiz_view.json()["questions"]
    q_ids = [q["id"] for q in questions]

    # Answer first correctly (b), second wrong (a)
    answers = {str(q_ids[0]): "b", str(q_ids[1]): "a"}
    attempt_resp = client.post(
        f"/api/quizzes/{quiz_id}/attempt",
        json={"quiz_id": quiz_id, "answers": answers},
    )
    assert attempt_resp.status_code == 200
    result = attempt_resp.json()
    assert result["score"] == 50.0
    assert result["passed"] is False


def test_progress_tracking(client: TestClient):
    register_and_login(client, "InstructorProg", "instprog@example.com", "pw", "instructor")
    course_resp = client.post(
        "/api/courses/",
        json={"title": "Progress Course", "description": "For progress test"},
    )
    course_id = course_resp.json()["id"]
    l1 = client.post("/api/lessons/", json={"course_id": course_id, "title": "L1", "order_index": 0}).json()
    l2 = client.post("/api/lessons/", json={"course_id": course_id, "title": "L2", "order_index": 1}).json()
    client.post("/api/auth/logout")

    register_and_login(client, "StudentProg", "stuprog@example.com", "pw", "student")
    client.post("/api/enrollments/", json={"course_id": course_id})

    client.post(f"/api/progress/lesson/{l1['id']}/complete")
    pct = client.get(f"/api/progress/course/{course_id}/percentage")
    assert pct.status_code == 200
    data = pct.json()
    assert data["completed"] == 1
    assert data["total"] == 2
    assert data["percentage"] == 50.0
