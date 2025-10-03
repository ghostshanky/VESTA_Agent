.PHONY: run test report clean install backend frontend

install:
	@echo "Installing Python dependencies..."
	uv sync
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

backend:
	@echo "Starting backend server..."
	uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload

frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

run:
	@echo "Starting full application..."
	@echo "Run 'make backend' in one terminal and 'make frontend' in another"

test:
	@echo "Running tests..."
	MOCK_MODE=true pytest tests/ -v

report:
	@echo "Generating priority report..."
	python -c "from backend.db import init_db, get_all_feedback, insert_report; from backend.crew_pipeline import generate_priority_report; init_db(); feedback = get_all_feedback(); report = generate_priority_report(feedback); insert_report(report); print(report)"

clean:
	@echo "Cleaning up..."
	rm -f customer_feedback.db test_*.db
	rm -rf __pycache__ */__pycache__ */*/__pycache__
	rm -rf .pytest_cache
	rm -rf frontend/.next frontend/node_modules
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Cleanup complete"

help:
	@echo "Available commands:"
	@echo "  make install   - Install all dependencies"
	@echo "  make backend   - Run backend server"
	@echo "  make frontend  - Run frontend development server"
	@echo "  make run       - Show instructions to run full application"
	@echo "  make test      - Run test suite"
	@echo "  make report    - Generate a priority report"
	@echo "  make clean     - Clean up generated files"
