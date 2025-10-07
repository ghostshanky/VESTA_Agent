# <img src="https://github.com/ghostshanky/VESTA_Agent/blob/main/VESTAicon.png?raw=true" alt="Alt Text" width="35" height="35"> VESTA - an AI Feedback Prioritizer

A production-quality AI-powered customer feedback analysis and prioritization system built with CrewAI, FastAPI, and Next.js.

## Features

### Core AI Pipeline
- **Three-Agent CrewAI System**:
  - **Classifier Agent**: Analyzes sentiment and categorizes feedback into themes
  - **Evaluator Agent**: Assigns urgency and impact scores with detailed justifications
  - **Prioritizer Agent**: Generates actionable Markdown reports for product teams

### Backend (FastAPI)
- RESTful API for feedback submission and retrieval
- SQLite database with proper schema for feedback, scores, and reports
- Robust error handling with LLM retry logic
- Configurable LLM models via environment variables
- Mock mode for offline demonstrations
- APScheduler for automated weekly report generation

### Frontend (Next.js + TailwindCSS)
- Interactive dashboard with real-time feedback viewing
- Sortable feedback table by urgency, impact, and priority
- Urgency vs Impact scatter chart visualization
- CSV bulk upload functionality
- Markdown report preview and generation

### Integrations
- **Slack**: Post weekly reports to channels
- **Email**: Send reports via SMTP with attachments and styled HTML emails
- **Notion**: Push reports to Notion databases

### Developer Experience
- Comprehensive pytest test suite
- Docker Compose for easy deployment
- Makefile with helpful shortcuts
- Example CSV data included
- Detailed logging with configurable levels

## Recent Enhancements

### Email Report Improvements
- Converted email report content from plain text to HTML using markdown conversion for better formatting.
- Enhanced email template with colors, shading, box shadows, and styled headers.
- Added VESTA Agent logo and footer message in the email.
- Styled admin panel link for better visibility.
- Ensured email sends correctly with SMTP credentials and environment variable configuration.

## Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- OpenAI API key (optional for mock mode)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/ghostshanky/VESTA_Agent.git
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your API keys and SMTP credentials
```

### Running the Application

#### Option 1: Development Mode
Run backend and frontend separately:

```bash
# Terminal 1: Backend
make backend

# Terminal 2: Frontend
make frontend
```

#### Option 2: Docker Compose
```bash
docker-compose up
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Usage

### Submit Feedback

**Via Web Interface:**
1. Navigate to the "Submit Feedback" tab
2. Enter feedback text and select source
3. Click "Submit Feedback"

**Via API:**
```bash
curl -X POST http://localhost:8000/feedback/ \
  -H "Content-Type: application/json" \
  -d '{"text": "Great product!", "source": "email"}'
```

**Via CSV Upload:**
```bash
curl -X POST http://localhost:8000/feedback/upload-csv \
  -F "file=@data/sample_feedback.csv"
```

### Generate Reports

**Via Web Interface:**
1. Navigate to the "Reports" tab
2. Click "Generate New Report"

**Via API:**
```bash
curl -X POST http://localhost:8000/report/generate
```

**Via Makefile:**
```bash
make report
```

## Testing

Run the full test suite:
```bash
make test
```

Run specific test files:
```bash
pytest tests/test_models.py -v
pytest tests/test_db.py -v
pytest tests/test_api.py -v
```

## API Endpoints

### Feedback
- `POST /feedback/` - Submit new feedback
- `GET /feedback/` - List all feedback
- `GET /feedback/{id}` - Get specific feedback
- `POST /feedback/upload-csv` - Bulk upload via CSV

### Reports
- `POST /report/generate` - Generate new priority report
- `GET /report/latest` - Get latest report
- `GET /report/all` - Get all reports

### System
- `GET /health` - Health check
- `GET /` - API information

## Project Structure

```
customer-feedback-prioritizer/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── db.py               # Database operations
│   ├── crew_pipeline.py    # CrewAI multi-agent pipeline
│   ├── scheduler.py        # APScheduler configuration
│   ├── models/
│   │   └── schemas.py      # Pydantic models
│   └── routes/
│       ├── feedback.py     # Feedback endpoints
│       └── reports.py      # Report endpoints
├── frontend/
│   ├── app/
│   │   └── page.tsx        # Main dashboard
│   └── components/
│       ├── FeedbackTable.tsx
│       ├── PriorityChart.tsx
│       ├── FeedbackForm.tsx
│       └── ReportViewer.tsx
├── integrations/
│   ├── slack.py            # Slack integration
│   ├── email_service.py    # Email integration
│   └── notion.py           # Notion integration
├── tests/
│   ├── test_models.py      # Model validation tests
│   ├── test_db.py          # Database tests
│   └── test_api.py         # API endpoint tests
├── data/
│   └── sample_feedback.csv # Example data
├── reports/                # Generated reports
├── .env.example            # Environment template
├── Makefile                # Development shortcuts
├── docker-compose.yml      # Docker configuration
└── README.md              # This file
```

## Mock Mode

For demonstrations without an OpenAI API key, enable mock mode:

```bash
export MOCK_MODE=true
make backend
```

Mock mode provides deterministic results for testing and demonstrations.

## Automated Scheduling

The system automatically generates and distributes reports based on the `REPORT_CRON` schedule. Reports are:
- Saved to the database
- Written to `reports/` directory
- Posted to Slack (if configured)
- Emailed to recipients (if configured)
- Pushed to Notion (if configured)

## Troubleshooting

**Backend won't start:**
- Check that all environment variables are set
- Verify Python dependencies: `pip install -r requirements.txt`
- Check logs for database initialization errors

**Frontend won't connect:**
- Ensure backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env`
- Check browser console for CORS errors

**LLM errors:**
- Verify `OPENAI_API_KEY` is set correctly
- Check API key permissions and billing
- Enable `MOCK_MODE=true` for testing without LLM

## Support

For issues and questions, please open an issue on GitHub.

---
