from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from datetime import datetime
from backend.db import init_db
from backend.routes import feedback, reports
from backend.models.schemas import HealthResponse

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    init_db()
    logger.info("Application started successfully")
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title="Customer Feedback Prioritization API",
    description="AI-powered customer feedback analysis and prioritization system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(reports.router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        from backend.db import get_db
        with get_db() as conn:
            conn.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    openai_key = os.getenv("OPENAI_API_KEY")
    llm_configured = bool(openai_key and openai_key.strip())
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        database=db_status,
        llm_configured=llm_configured
    )


@app.get("/")
async def root():
    return {
        "message": "Customer Feedback Prioritization API",
        "version": "1.0.0",
        "docs": "/docs"
    }
