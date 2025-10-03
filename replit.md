# Customer Feedback Prioritization System

## Overview

An AI-powered customer feedback analysis and prioritization system that uses a three-agent CrewAI pipeline to classify, evaluate, and prioritize customer feedback. The system features a FastAPI backend with SQLite storage, scheduled report generation, and a Next.js dashboard for visualization and interaction. It integrates with Slack, email, and Notion for automated report distribution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture (FastAPI + Python)

**Problem Addressed**: Need for a scalable API layer to handle feedback submission, processing, and report generation.

**Solution**: FastAPI with modular routing, database abstraction, and background job scheduling.

- **API Structure**: Modular routers in `backend/routes/` for feedback and reports endpoints
- **Database Layer**: SQLite with context manager pattern (`backend/db.py`) for connection management and transaction safety
- **AI Pipeline**: Three-agent CrewAI system with classifier, evaluator, and prioritizer agents
- **Background Scheduling**: APScheduler for automated weekly report generation and distribution
- **Error Handling**: Retry logic for LLM calls, graceful degradation with mock mode for offline demos
- **Configuration**: Environment-variable driven LLM model selection and integration settings

**Alternatives Considered**: PostgreSQL was considered but SQLite chosen for simpler deployment and adequate performance for feedback scale.

**Pros**: Fast development, easy deployment, strong type safety with Pydantic
**Cons**: SQLite may need migration for high-volume production use

### AI Processing Pipeline (CrewAI)

**Problem Addressed**: Need for intelligent, multi-step analysis of unstructured feedback.

**Solution**: Multi-agent CrewAI pipeline with specialized roles and structured outputs.

- **Agent Architecture**: Three sequential agents (Classifier → Evaluator → Prioritizer)
- **Schema Validation**: Strict Pydantic models for structured outputs (ClassifiedFeedback, PrioritizationScore)
- **LLM Abstraction**: Configurable LangChain OpenAI integration with model and temperature settings
- **Mock Mode**: Fallback mode for demonstrations without API credentials

**Pros**: Clear separation of concerns, extensible agent design, type-safe outputs
**Cons**: Sequential processing may be slower than parallel for large batches

### Frontend Architecture (Next.js 15 + React 19)

**Problem Addressed**: Need for interactive dashboard to visualize and manage feedback.

**Solution**: Next.js App Router with client-side components for real-time interactions.

- **Component Structure**: Modular components (FeedbackTable, PriorityChart, FeedbackForm, ReportViewer)
- **Data Visualization**: Recharts for scatter plot showing urgency vs impact
- **State Management**: React hooks for local state, axios for API communication
- **Styling**: TailwindCSS v4 with custom theme configuration
- **Development**: Turbopack for faster builds and hot reload

**Pros**: Modern React features, excellent developer experience, flexible styling
**Cons**: Client-side rendering requires all data fetching from browser

### Data Storage (SQLite)

**Problem Addressed**: Need for persistent storage of feedback, scores, and generated reports.

**Solution**: SQLite with normalized schema and proper indexing.

- **Schema Design**: Three main tables (feedback, scores, reports) with foreign key relationships
- **Transaction Management**: Context manager pattern ensures atomicity and rollback on errors
- **Query Interface**: Helper functions abstract SQL operations for cleaner code

**Database Schema**:
- `feedback`: Raw feedback with classification results (sentiment, theme, summary)
- `scores`: Urgency/impact scores and justifications linked to feedback
- `reports`: Generated markdown reports with timestamps

**Pros**: Zero configuration, embedded database, ACID compliance
**Cons**: Limited concurrency, single-file storage

### Authentication & Authorization

**Current State**: No authentication implemented - open API access.

**Design Decision**: Prioritized rapid development over security for MVP/hackathon context.

**Future Consideration**: Will need API keys, JWT tokens, or OAuth for production deployment.

## External Dependencies

### AI/ML Services

- **OpenAI GPT Models** (via LangChain): LLM backend for agent reasoning
  - Configurable model selection (default: gpt-4o-mini)
  - Requires `OPENAI_API_KEY` environment variable
  - Fallback to mock mode if not configured

- **CrewAI Framework**: Multi-agent orchestration framework
  - Coordinates sequential agent execution
  - Handles prompt engineering and output parsing

### Communication & Integration Services

- **Slack Integration** (`slack_sdk`): Posts weekly reports to channels
  - Requires `SLACK_BOT_TOKEN` and `SLACK_CHANNEL` environment variables
  - Formats reports as rich message blocks

- **Email Service** (SMTP): Sends reports via email with attachments
  - Requires `SMTP_SERVER`, `SMTP_PORT`, `SENDER_EMAIL`, `SENDER_PASSWORD`
  - Supports both plain text and HTML formats

- **Notion API** (`httpx`): Creates pages in Notion databases
  - Requires `NOTION_API_KEY` and `NOTION_DATABASE_ID`
  - Uses Notion API v2022-06-28

### Frontend Libraries

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TailwindCSS 4**: Utility-first CSS framework
- **Recharts**: Data visualization library for charts
- **axios**: HTTP client for API requests
- **react-markdown**: Markdown rendering for reports

### Backend Libraries

- **FastAPI**: Web framework with automatic OpenAPI docs
- **Pydantic**: Data validation and serialization
- **APScheduler**: Background job scheduling for automated reports
- **LangChain**: LLM abstraction layer

### Testing

- **pytest**: Testing framework with fixtures for database isolation

### Development Tools

- **Docker Compose**: Container orchestration for deployment
- **Makefile**: Task automation and shortcuts