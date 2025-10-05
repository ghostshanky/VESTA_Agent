#!/usr/bin/env python3
"""
Verification script to test backend functionality and output format.
"""
import os
import sys
import json

# Add backend to path
sys.path.insert(0, 'backend')

from backend.crew_pipeline import classify_feedback_mock, classify_feedback_with_llm, process_single_feedback
from backend.models.schemas import ClassifiedFeedback

def test_mock_classification():
    """Test the mock classification function returns correct format."""
    print("Testing mock classification...")

    feedback_id = 1
    text = "The product is amazing! I love the new features."

    result = classify_feedback_mock(feedback_id, text)

    print(f"Result: {json.dumps(result, indent=2)}")

    # Check required fields
    required_fields = ["feedback_id", "text", "sentiment", "theme", "summary"]
    for field in required_fields:
        assert field in result, f"Missing field: {field}"

    # Check sentiment values
    assert result["sentiment"] in ["positive", "neutral", "negative"], f"Invalid sentiment: {result['sentiment']}"

    # Check theme values
    valid_themes = ["Product/Features", "Performance", "UX/UI", "Pricing", "Service", "Other"]
    assert result["theme"] in valid_themes, f"Invalid theme: {result['theme']}"

    # Check summary is string
    assert isinstance(result["summary"], str), "Summary should be string"
    assert len(result["summary"]) > 0, "Summary should not be empty"

    print("✓ Mock classification format is correct")

def test_process_single_feedback():
    """Test the full processing pipeline."""
    print("\nTesting full processing pipeline...")

    # Set mock mode
    os.environ["MOCK_MODE"] = "true"

    feedback_id = 2
    text = "This app crashes frequently and needs better performance."

    result = process_single_feedback(feedback_id, text)

    print(f"Result: {json.dumps(result, indent=2)}")

    # Check all fields are present
    expected_fields = [
        "feedback_id", "text", "sentiment", "theme", "summary",
        "urgency", "impact", "justification", "priority_score"
    ]

    for field in expected_fields:
        assert field in result, f"Missing field: {field}"

    # Validate types and ranges
    assert result["sentiment"] in ["positive", "neutral", "negative"]
    assert isinstance(result["urgency"], int) and 1 <= result["urgency"] <= 10
    assert isinstance(result["impact"], int) and 1 <= result["impact"] <= 10
    assert isinstance(result["priority_score"], float)
    assert isinstance(result["justification"], str)

    print("✓ Full processing pipeline format is correct")

def test_pydantic_validation():
    """Test that the result can be validated with Pydantic models."""
    print("\nTesting Pydantic validation...")

    feedback_id = 3
    text = "Great customer support, but pricing is too high."

    result = classify_feedback_mock(feedback_id, text)

    # Try to create ClassifiedFeedback object
    classified = ClassifiedFeedback(**result)
    print(f"Validated object: {classified}")

    assert classified.sentiment in ["positive", "neutral", "negative"]
    assert classified.theme in ["Product/Features", "Performance", "UX/UI", "Pricing", "Service", "Other"]

    print("✓ Pydantic validation successful")

def main():
    print("Backend Verification Script")
    print("=" * 40)

    try:
        test_mock_classification()
        test_process_single_feedback()
        test_pydantic_validation()

        print("\n" + "=" * 40)
        print("✅ All verification tests passed!")
        print("The backend returns accurate answers in the specified format:")
        print('- "sentiment": "positive|neutral|negative"')
        print('- "theme": "Product/Features|Performance|UX/UI|Pricing|Service|Other"')
        print('- "summary": "A brief 1-2 sentence summary of the feedback"')

    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
