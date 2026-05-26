# LearnHub — Online Course Management System

LearnHub is a premium, modern, and interactive online learning platform designed to connect Instructors and Students. The platform features course creation with video uploading, thumbnail uploads, interactive quizzes, automated progress tracking, and course management dashboards, all styled within a stunning, glassmorphic dark-mode interface.

## 🚀 Key Features

### 👨‍🏫 Instructor Workspace
* **Step-by-Step Course Wizard**: Build courses in 3 easy steps (Course Details, Add Lessons, Review & Publish).
* **Multimedia Uploading**: Upload course thumbnails and lesson videos seamlessly.
* **Auto-Save Content**: Form fields automatically validate and save lesson videos and titles when transitioning between creation steps.
* **Quiz Builder**: Build interactive multiple-choice quizzes and attach them directly to lessons.
* **Course Management**: Edit course details, reorder lessons, or safely delete courses along with their associated lessons and quizzes.

### 🎓 Student Learning Space
* **Interactive Dashboard**: Track enrolled course counts, average completion progress, and completed courses.
* **Sleek Course Catalog**: Browse all available courses from all instructors with rich details (thumbnails, descriptions, instructor names, and lesson counts).
* **One-Click Enrollment**: Instantly enroll in courses and begin learning immediately without reloading.
* **Course Archiving & Completed Tab**: Clean up your active workspace by moving finished courses to the "Completed Courses" tab, or completely unenroll to wipe your progress.
* **Interactive Player & Quizzes**: Stream lesson videos, mark lessons as complete, and test your knowledge with lesson-specific quizzes.

### ⚙️ Platform & Infrastructure
* **AWS S3 / Mock S3 Storage**: Fully integrates with AWS S3 for media storage, with an automated local **Mock S3 fallback** route for developer-friendly offline testing.
* **Auto-Redirect Navigation**: Intelligent navbar controls keep logged-in users inside their workspace dashboards and prevent landing page redirects.
* **Responsive Layouts**: Premium UI/UX styling built with CSS and Lucide icons, responsive across mobile, tablet, and desktop screens.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), React Router DOM, Lucide Icons, React Hot Toast, Vanilla CSS.
* **Backend**: FastAPI (Python), SQLAlchemy ORM (SQLite database), Pydantic validation, Uvicorn server.
* **Storage**: AWS S3 API with local binary mock-storage fallback (`backend/mock_s3_storage`).

---

## 📂 Project Architecture

```text
coursemanagement/
├── backend/
│   ├── app/
│   │   ├── api/             # Routes (courses, enrollments, quizzes, mock-s3, auth)
│   │   ├── core/            # Database config, security, S3 client
│   │   ├── models/          # SQLAlchemy Database Models (User, Course, Enrollment, Progress)
│   │   ├── schemas/         # Pydantic Schemas
│   │   └── services/        # Business Logic & DB queries
│   ├── tests/               # Backend PyTest suite
│   ├── course_platform.db   # SQLite Database
│   └── requirements.txt     # Python Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI Components (Navbar, CourseCard, VideoPlayer, QuizWidget)
    │   ├── context/         # React AuthContext
    │   ├── pages/           # Pages (Dashboard, CourseCreate, CourseView, Login, Home)
    │   ├── services/        # Axios API Client & Services
    │   └── index.css        # Core Design System & CSS Utility classes
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+**

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend server will run on `http://127.0.0.1:8000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

---

## 🧪 Testing & Verification

### Running Automated Tests
To execute backend tests:
```bash
cd backend
venv\Scripts\pytest
```

### Manual Verification
1. **Create Courses**: Sign in as an **Instructor**, create a course, and upload a thumbnail and lesson video. Verify the course wizard auto-saves step details.
2. **Browse & Enroll**: Sign in as a **Student**. Go to the **Browse Courses** tab, select a course, and click **Enroll**.
3. **Complete & Archive**: Mark your lessons complete, take the lesson quiz, and use the trash delete icon on your card to archive the course under the **Completed Courses** tab.
