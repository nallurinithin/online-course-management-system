import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base
from app.api.dependencies import get_db

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test_auth.db"

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


# ── Register ───────────────────────────────────────────────────────────────────

def test_register_success(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "student"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "student"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client: TestClient):
    payload = {"name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "student"}
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


# ── Login ──────────────────────────────────────────────────────────────────────

def test_login_success(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "password1", "role": "student"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "password1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "bob@example.com"
    # Cookie must be set
    assert "access_token" in response.cookies


def test_login_wrong_password(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"name": "Carol", "email": "carol@example.com", "password": "rightpass", "role": "student"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "carol@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401


def test_login_unknown_email(client: TestClient):
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "whatever"},
    )
    assert response.status_code == 401


# ── /me ────────────────────────────────────────────────────────────────────────

def test_get_me_without_cookie(client: TestClient):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_get_me_with_valid_cookie(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"name": "Dave", "email": "dave@example.com", "password": "pw123", "role": "student"},
    )
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "pw123"},
    )
    assert login_resp.status_code == 200
    # TestClient persists cookies automatically after login
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "dave@example.com"


# ── Logout ─────────────────────────────────────────────────────────────────────

def test_logout_clears_cookie(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"name": "Eve", "email": "eve@example.com", "password": "evepw", "role": "student"},
    )
    client.post(
        "/api/auth/login",
        json={"email": "eve@example.com", "password": "evepw"},
    )
    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json() == {"message": "Logged out"}
    # After logout, /me should return 401
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 401


# ── Instructor registration ────────────────────────────────────────────────────

def test_register_as_instructor(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={"name": "Frank", "email": "frank@example.com", "password": "frankpw", "role": "instructor"},
    )
    assert response.status_code == 200
    assert response.json()["role"] == "instructor"
