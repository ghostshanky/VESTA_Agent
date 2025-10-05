#!/usr/bin/env python3
"""
Test script for backend API edge cases and error handling.
"""
import os
import json
import requests
import tempfile
from fastapi.testclient import TestClient
from backend.app import app
from backend.db import init_db
import backend.db as db_module

def test_edge_cases():
    """Test backend API edge cases and error handling."""
    print("Testing backend API edge cases...")

    # Create a temporary database for testing
    test_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
    test_db.close()

    original_db_path = db_module.DB_PATH
    db_module.DB_PATH = test_db.name

    try:
        init_db()
        client = TestClient(app)

        # Test 1: Empty feedback text
        print("  Testing empty feedback text...")
        response = client.post("/feedback/", json={"text": "", "source": "test"})
        assert response.status_code == 200  # Should still process empty text
        data = response.json()
        assert "sentiment" in data
        print("    ✓ Empty text handled correctly")

        # Test 2: Very long feedback text
        print("  Testing very long feedback text...")
        long_text = "This is a very long feedback text. " * 1000
        response = client.post("/feedback/", json={"text": long_text, "source": "test"})
        assert response.status_code == 200
        data = response.json()
        assert len(data["text"]) == len(long_text)
        print("    ✓ Long text handled correctly")

        # Test 3: Special characters in feedback
        print("  Testing special characters...")
        special_text = "Feedback with émojis 😀 and symbols @#$%^&*()"
        response = client.post("/feedback/", json={"text": special_text, "source": "test"})
        assert response.status_code == 200
        data = response.json()
        assert data["text"] == special_text
        print("    ✓ Special characters handled correctly")

        # Test 4: Invalid feedback ID
        print("  Testing invalid feedback ID...")
        response = client.get("/feedback/99999")
        assert response.status_code == 404
        print("    ✓ Invalid ID returns 404")

        # Test 5: Missing required fields
        print("  Testing missing required fields...")
        response = client.post("/feedback/", json={"source": "test"})  # Missing text
        assert response.status_code == 422  # Validation error
        print("    ✓ Missing fields return validation error")

        # Test 6: Invalid source (should still work)
        print("  Testing invalid source...")
        response = client.post("/feedback/", json={"text": "Test", "source": ""})
        assert response.status_code == 200
        print("    ✓ Invalid source handled gracefully")

        # Test 7: Report generation with no feedback
        print("  Testing report generation with no feedback...")
        response = client.post("/report/generate")
        assert response.status_code == 200
        data = response.json()
        assert "markdown_report" in data
        print("    ✓ Report generation with no feedback works")

        # Test 8: Get latest report when none exists
        print("  Testing get latest report when none exists...")
        response = client.get("/report/latest")
        assert response.status_code == 404
        print("    ✓ No reports returns 404")

        # Test 9: Invalid CSV upload
        print("  Testing invalid CSV upload...")
        response = client.post("/feedback/upload-csv", files={"file": ("test.txt", "not csv content")})
        assert response.status_code == 400
        print("    ✓ Invalid file type rejected")

        # Test 10: Health check
        print("  Testing health check...")
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("    ✓ Health check works")

        print("✅ All edge case tests passed!")
        return True

    except Exception as e:
        print(f"❌ Edge case test failed: {e}")
        return False
    finally:
        # Cleanup
        db_module.DB_PATH = original_db_path
        if os.path.exists(test_db.name):
            os.unlink(test_db.name)

def test_error_handling():
    """Test error handling scenarios."""
    print("\nTesting error handling scenarios...")

    # Test with mock mode to avoid LLM dependency issues
    os.environ["MOCK_MODE"] = "true"

    test_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
    test_db.close()

    original_db_path = db_module.DB_PATH
    db_module.DB_PATH = test_db.name

    try:
        init_db()
        client = TestClient(app)

        # Test database connection issues (simulate by corrupting DB)
        print("  Testing database error handling...")
        # This is hard to simulate cleanly, but we can test the basic error responses

        # Test malformed JSON
        print("  Testing malformed JSON...")
        response = client.post("/feedback/", data="invalid json")
        assert response.status_code == 422
        print("    ✓ Malformed JSON handled")

        print("✅ Error handling tests passed!")
        return True

    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False
    finally:
        os.environ.pop("MOCK_MODE", None)
        db_module.DB_PATH = original_db_path
        if os.path.exists(test_db.name):
            os.unlink(test_db.name)

def main():
    print("Backend Edge Cases and Error Handling Test")
    print("=" * 50)

    edge_cases_ok = test_edge_cases()
    error_handling_ok = test_error_handling()

    print("\n" + "=" * 50)
    if edge_cases_ok and error_handling_ok:
        print("✅ All backend edge case and error handling tests passed!")
    else:
        print("❌ Some tests failed.")
        if not edge_cases_ok:
            print("- Edge cases tests failed")
        if not error_handling_ok:
            print("- Error handling tests failed")

if __name__ == "__main__":
    main()
