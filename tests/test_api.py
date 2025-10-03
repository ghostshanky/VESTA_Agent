import pytest
from fastapi.testclient import TestClient
import os


os.environ["MOCK_MODE"] = "true"

from backend.app import app
from backend.db import init_db


@pytest.fixture
def client():
    test_db_path = "test_api_feedback.db"
    
    import backend.db as db_module
    original_db_path = db_module.DB_PATH
    db_module.DB_PATH = test_db_path
    
    init_db()
    
    test_client = TestClient(app)
    
    yield test_client
    
    db_module.DB_PATH = original_db_path
    if os.path.exists(test_db_path):
        os.remove(test_db_path)


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_submit_feedback(client):
    feedback_data = {
        "text": "The product is amazing!",
        "source": "email"
    }
    response = client.post("/feedback/", json=feedback_data)
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "The product is amazing!"
    assert "sentiment" in data


def test_list_feedback(client):
    client.post("/feedback/", json={"text": "Test feedback 1"})
    client.post("/feedback/", json={"text": "Test feedback 2"})
    
    response = client.get("/feedback/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_generate_report(client):
    client.post("/feedback/", json={"text": "Great product!"})
    client.post("/feedback/", json={"text": "Needs improvement"})
    
    response = client.post("/report/generate")
    assert response.status_code == 200
    data = response.json()
    assert "markdown_report" in data


def test_get_latest_report(client):
    client.post("/report/generate")
    
    response = client.get("/report/latest")
    assert response.status_code == 200
    data = response.json()
    assert "markdown_report" in data
