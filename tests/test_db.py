import pytest
import os
import sqlite3
from backend.db import (
    init_db,
    insert_feedback,
    update_feedback_classification,
    insert_score,
    get_all_feedback,
    get_feedback_by_id,
    insert_report,
    get_latest_report
)


@pytest.fixture
def test_db():
    test_db_path = "test_feedback.db"
    
    import backend.db as db_module
    original_db_path = db_module.DB_PATH
    db_module.DB_PATH = test_db_path
    
    init_db()
    
    yield
    
    db_module.DB_PATH = original_db_path
    if os.path.exists(test_db_path):
        os.remove(test_db_path)


def test_insert_and_get_feedback(test_db):
    feedback_id = insert_feedback("Test feedback", "test")
    assert feedback_id > 0
    
    result = get_feedback_by_id(feedback_id)
    assert result is not None
    assert result["text"] == "Test feedback"
    assert result["source"] == "test"


def test_update_feedback_classification(test_db):
    feedback_id = insert_feedback("Great product!", "test")
    update_feedback_classification(feedback_id, "positive", "Feature Request", "User loves the product")
    
    result = get_feedback_by_id(feedback_id)
    assert result["sentiment"] == "positive"
    assert result["theme"] == "Feature Request"
    assert result["summary"] == "User loves the product"


def test_insert_score(test_db):
    feedback_id = insert_feedback("Critical bug", "test")
    insert_score(feedback_id, 9, 8, "High urgency bug", 8.6)
    
    result = get_feedback_by_id(feedback_id)
    assert result["urgency"] == 9
    assert result["impact"] == 8
    assert result["priority_score"] == 8.6


def test_get_all_feedback(test_db):
    insert_feedback("Feedback 1", "test")
    insert_feedback("Feedback 2", "test")
    
    all_feedback = get_all_feedback()
    assert len(all_feedback) >= 2


def test_insert_and_get_report(test_db):
    report_text = "# Test Report\n\nThis is a test report."
    report_id = insert_report(report_text)
    
    latest = get_latest_report()
    assert latest is not None
    assert latest["markdown_report"] == report_text
