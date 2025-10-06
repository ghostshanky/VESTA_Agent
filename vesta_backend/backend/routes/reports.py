from fastapi import APIRouter, HTTPException
from typing import List
import logging
from datetime import datetime
import os
from backend.models.schemas import ReportResponse
from backend.db import get_all_feedback, insert_report, get_latest_report, get_all_reports
from backend.crew_pipeline import generate_priority_report
from integrations.email_integration import EmailIntegration

router = APIRouter(prefix="/report", tags=["reports"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=ReportResponse)
async def generate_report():
    try:
        feedback_list = get_all_feedback()

        markdown_report = generate_priority_report(feedback_list)

        insert_report(markdown_report)

        os.makedirs("reports", exist_ok=True)
        filename = f"reports/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.md"
        with open(filename, 'w') as f:
            f.write(markdown_report)
        logger.info(f"Report saved to {filename}")

        # Send email with report
        email_integration = EmailIntegration()
        subject = f"Feedback Priority Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        body = markdown_report + "\n\nAccess the Admin Panel here: http://localhost:5000"
        success = email_integration.send_report_email(subject, body)
        if success:
            logger.info("Report email sent successfully")
        else:
            logger.warning("Failed to send report email")

        report = get_latest_report()
        if not report:
            raise HTTPException(status_code=500, detail="Failed to retrieve generated report")

        return ReportResponse(**report)
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest", response_model=ReportResponse)
async def get_latest():
    try:
        report = get_latest_report()
        if not report:
            raise HTTPException(status_code=404, detail="No reports found")
        return ReportResponse(**report)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting latest report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all", response_model=List[ReportResponse])
async def get_all():
    try:
        reports = get_all_reports()
        return [ReportResponse(**report) for report in reports]
    except Exception as e:
        logger.error(f"Error getting all reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))
