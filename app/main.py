import json
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    import psycopg
except ImportError:  # CI/local can still serve the static study site
    psycopg = None

from app.ai_grading import router as ai_router

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Resumen Máster IA", docs_url=None, redoc_url=None)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.include_router(ai_router)


def database_url():
    url = os.getenv("DATABASE_URL", "").strip()
    if url.startswith("postgresql+psycopg://"):
        url = "postgresql://" + url.split("://", 1)[1]
    return url


def get_conn():
    url = database_url()
    if not url or psycopg is None:
        return None
    return psycopg.connect(url, connect_timeout=4)


def init_db():
    conn = get_conn()
    if conn is None:
        return False
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS attempts (
                        id BIGSERIAL PRIMARY KEY,
                        profile_id TEXT NOT NULL,
                        subject_id TEXT NOT NULL,
                        question_index INTEGER NOT NULL,
                        score NUMERIC NOT NULL,
                        answer JSONB,
                        feedback JSONB,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                """)
                cur.execute("ALTER TABLE attempts ADD COLUMN IF NOT EXISTS feedback JSONB")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS progress (
                        profile_id TEXT NOT NULL,
                        subject_id TEXT NOT NULL,
                        topic_number INTEGER NOT NULL,
                        done BOOLEAN NOT NULL DEFAULT TRUE,
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        PRIMARY KEY(profile_id, subject_id, topic_number)
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS study_material (
                        subject_id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        material JSONB NOT NULL,
                        questions JSONB NOT NULL DEFAULT '[]'::jsonb,
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                """)
        return True
    finally:
        conn.close()


@app.on_event("startup")
def startup():
    try:
        init_db()
    except Exception:
        # The study material remains usable even if PostgreSQL is temporarily unavailable.
        pass


class Attempt(BaseModel):
    profile_id: str
    subject_id: str
    question_index: int
    score: float
    answer: object | None = None
    feedback: object | None = None


class Progress(BaseModel):
    profile_id: str
    subject_id: str
    topic_number: int
    done: bool = True


class CatalogSync(BaseModel):
    courses: list[dict]
    questions: dict[str, list[dict]] = {}


@app.get("/health")
def health():
    db = False
    conn = None
    try:
        conn = get_conn()
        if conn is not None:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                db = cur.fetchone()[0] == 1
    except Exception:
        db = False
    finally:
        if conn is not None:
            conn.close()
    return {"status": "ok", "database": db}


@app.post("/api/attempt")
def save_attempt(item: Attempt):
    conn = get_conn()
    if conn is None:
        return {"saved": False, "database": False}
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO attempts(profile_id, subject_id, question_index, score, answer, feedback)
                    VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb)
                    """,
                    (
                        item.profile_id,
                        item.subject_id,
                        item.question_index,
                        item.score,
                        json.dumps(item.answer, ensure_ascii=False),
                        json.dumps(item.feedback, ensure_ascii=False),
                    ),
                )
        return {"saved": True, "database": True}
    finally:
        conn.close()


@app.post("/api/progress")
def save_progress(item: Progress):
    conn = get_conn()
    if conn is None:
        return {"saved": False, "database": False}
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO progress(profile_id, subject_id, topic_number, done)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT(profile_id, subject_id, topic_number)
                    DO UPDATE SET done=EXCLUDED.done, updated_at=NOW()
                    """,
                    (item.profile_id, item.subject_id, item.topic_number, item.done),
                )
        return {"saved": True, "database": True}
    finally:
        conn.close()


@app.post("/api/catalog/sync")
def sync_catalog(item: CatalogSync):
    """Persist the versioned study material in the Y700 PostgreSQL database.

    The browser sends the same catalog bundled with the deployed application. This keeps
    Git as the editable source of truth while PostgreSQL stores a queryable copy together
    with exam banks, attempts and progress.
    """
    conn = get_conn()
    if conn is None:
        return {"saved": False, "database": False, "subjects": 0}
    saved = 0
    try:
        with conn:
            with conn.cursor() as cur:
                for course in item.courses:
                    subject_id = str(course.get("id", "")).strip()
                    title = str(course.get("title", subject_id)).strip()
                    if not subject_id:
                        continue
                    cur.execute(
                        """
                        INSERT INTO study_material(subject_id, title, material, questions)
                        VALUES (%s, %s, %s::jsonb, %s::jsonb)
                        ON CONFLICT(subject_id)
                        DO UPDATE SET
                            title=EXCLUDED.title,
                            material=EXCLUDED.material,
                            questions=EXCLUDED.questions,
                            updated_at=NOW()
                        """,
                        (
                            subject_id,
                            title,
                            json.dumps(course, ensure_ascii=False),
                            json.dumps(item.questions.get(subject_id, []), ensure_ascii=False),
                        ),
                    )
                    saved += 1
        return {"saved": True, "database": True, "subjects": saved}
    finally:
        conn.close()


@app.get("/api/stats/{profile_id}")
def stats(profile_id: str):
    conn = get_conn()
    if conn is None:
        return {"database": False, "attempts": [], "progress": []}
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT subject_id, COUNT(*)::int, ROUND(AVG(score)::numeric, 2)
                FROM attempts
                WHERE profile_id=%s
                GROUP BY subject_id
                ORDER BY subject_id
                """,
                (profile_id,),
            )
            attempts = [
                {"subject_id": r[0], "attempts": r[1], "average": float(r[2])}
                for r in cur.fetchall()
            ]
            cur.execute(
                """
                SELECT subject_id, topic_number, done
                FROM progress
                WHERE profile_id=%s
                ORDER BY subject_id, topic_number
                """,
                (profile_id,),
            )
            progress = [
                {"subject_id": r[0], "topic_number": r[1], "done": r[2]}
                for r in cur.fetchall()
            ]
        return {"database": True, "attempts": attempts, "progress": progress}
    finally:
        conn.close()


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(STATIC_DIR / "index.html")
