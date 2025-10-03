import pytest
from backend.models.schemas import (
    FeedbackInput,
    ClassifiedFeedback,
    PrioritizationScore,
    FeedbackResponse,
    HealthResponse
)
from datetime import datetime


def test_feedback_input_valid():
    feedback = FeedbackInput(text="Great product!", source="email")
    assert feedback.text == "Great product!"
    assert feedback.source == "email"


def test_feedback_input_default_source():
    feedback = FeedbackInput(text="Good service")
    assert feedback.source == "manual"


def test_classified_feedback():
    classified = ClassifiedFeedback(
        feedback_id=1,
        text="The app crashes often",
        sentiment="negative",
        theme="Bug Report",
        summary="User reports frequent crashes"
    )
    assert classified.sentiment == "negative"
    assert classified.theme == "Bug Report"


def test_prioritization_score_validation():
    score = PrioritizationScore(
        feedback_id=1,
        urgency=8,
        impact=9,
        justification="Critical bug affecting users",
        priority_score=8.4
    )
    assert score.urgency == 8
    assert score.impact == 9
    
    with pytest.raises(ValueError):
        PrioritizationScore(
            feedback_id=1,
            urgency=11,
            impact=5,
            justification="Invalid urgency",
            priority_score=5.0
        )


def test_health_response():
    health = HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        database="healthy",
        llm_configured=True
    )
    assert health.status == "healthy"
    assert health.llm_configured is True
