from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class FeedbackInput(BaseModel):
    text: str = Field(..., description="Raw customer feedback text")
    source: Optional[str] = Field(default="manual", description="Source of feedback (e.g., email, survey, support)")


class ClassifiedFeedback(BaseModel):
    feedback_id: int
    text: str
    sentiment: Literal["positive", "neutral", "negative"]
    theme: str
    summary: str


class PrioritizationScore(BaseModel):
    feedback_id: int
    urgency: int = Field(..., ge=1, le=10, description="Urgency score from 1-10")
    impact: int = Field(..., ge=1, le=10, description="Impact score from 1-10")
    justification: str
    priority_score: float = Field(..., description="Calculated priority score")


class FeedbackResponse(BaseModel):
    id: int
    text: str
    source: str
    sentiment: Optional[str] = None
    theme: Optional[str] = None
    summary: Optional[str] = None
    urgency: Optional[int] = None
    impact: Optional[int] = None
    justification: Optional[str] = None
    priority_score: Optional[float] = None
    created_at: datetime


class ReportResponse(BaseModel):
    id: int
    generated_at: datetime
    markdown_report: str


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database: str
    llm_configured: bool
