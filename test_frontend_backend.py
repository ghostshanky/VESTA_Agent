#!/usr/bin/env python3
"""
Test script to verify frontend-backend connectivity.
"""
import requests
import json

def test_backend_connectivity():
    """Test that backend is accessible and returns correct data."""
    print("Testing backend connectivity...")

    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health")
        assert response.status_code == 200
        health_data = response.json()
        print(f"✓ Health check: {health_data['status']}, LLM configured: {health_data['llm_configured']}")

        # Test feedback endpoint
        response = requests.get("http://localhost:8000/feedback/")
        assert response.status_code == 200
        feedback_data = response.json()
        print(f"✓ Feedback endpoint: {len(feedback_data)} items retrieved")

        # Test submitting feedback
        test_feedback = {
            "text": "Frontend-backend connectivity test",
            "source": "test"
        }
        response = requests.post("http://localhost:8000/feedback/", json=test_feedback)
        assert response.status_code == 200
        submitted_data = response.json()
        print(f"✓ Feedback submission: ID {submitted_data['id']} created")
        print(f"  Sentiment: {submitted_data.get('sentiment', 'N/A')}")
        print(f"  Theme: {submitted_data.get('theme', 'N/A')}")
        print(f"  Priority Score: {submitted_data.get('priority_score', 'N/A')}")

        return True

    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except AssertionError as e:
        print(f"❌ Assertion error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_frontend_accessibility():
    """Test that frontend is accessible."""
    print("\nTesting frontend accessibility...")

    try:
        # Test frontend root
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("✓ Frontend is accessible at http://localhost:5000")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to frontend: {e}")
        return False

def main():
    print("Frontend-Backend Connectivity Test")
    print("=" * 40)

    backend_ok = test_backend_connectivity()
    frontend_ok = test_frontend_accessibility()

    print("\n" + "=" * 40)
    if backend_ok and frontend_ok:
        print("✅ All connectivity tests passed!")
        print("Frontend and backend are properly linked.")
        print("\nEnvironment Variables Set:")
        print("- Backend: OPENAI_API_KEY, OPENAI_BASE_URL, MOCK_MODE=false")
        print("- Frontend: NEXT_PUBLIC_API_URL=http://localhost:8000")
    else:
        print("❌ Some connectivity tests failed.")
        if not backend_ok:
            print("- Backend connectivity issues")
        if not frontend_ok:
            print("- Frontend accessibility issues")

if __name__ == "__main__":
    main()
