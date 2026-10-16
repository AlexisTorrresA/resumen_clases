from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_home():
    r = client.get("/")
    assert r.status_code == 200
    assert "Study Hub" in r.text

def test_progress_without_database():
    r = client.post("/api/progress", json={
        "profile_id":"test", "subject_id":"pln", "topic_number":1, "done":True
    })
    assert r.status_code == 200
    assert "saved" in r.json()

def test_attempt_without_database():
    r = client.post("/api/attempt", json={
        "profile_id":"test", "subject_id":"pln", "question_index":0,
        "score":1, "answer":"A"
    })
    assert r.status_code == 200
    assert "saved" in r.json()

def test_stats_without_database():
    r = client.get("/api/stats/test")
    assert r.status_code == 200
    assert "attempts" in r.json()
