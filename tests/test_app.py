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


def test_study_state_fallback():
    r = client.get("/api/study-state/test-profile")
    assert r.status_code == 200
    assert "data" in r.json()
    p = client.post("/api/study-state", json={"profile_id": "test-profile", "data": {"notes": {"pln:1": "recuerdo"}}})
    assert p.status_code == 200
    assert "saved" in p.json()


def test_study_state_rejects_large_payload():
    r = client.post("/api/study-state", json={"profile_id": "test-profile", "data": {"text": "a" * 1500100}})
    assert r.status_code == 413


def test_home_loads_study_workspace():
    r = client.get("/")
    assert r.status_code == 200
    assert "study-workspace.js" in r.text
    assert "study-workspace.css" in r.text
    assert client.get("/static/study-workspace.js").status_code == 200


def test_taa_study_cards_are_served():
    res=client.get("/")
    assert res.status_code==200
    for asset in ("taa-fichas-data.js","taa-fichas-view.js","taa-fichas.css"):
        assert asset in res.text
        assert client.get("/static/"+asset).status_code==200
