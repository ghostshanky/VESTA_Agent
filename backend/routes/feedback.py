from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import csv
import io
import logging
from backend.models.schemas import FeedbackInput, FeedbackResponse
from backend.db import insert_feedback, get_all_feedback, get_feedback_by_id, delete_feedback
from backend.crew_pipeline import process_single_feedback

router = APIRouter(prefix="/feedback", tags=["feedback"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackInput):
    try:
        feedback_id = insert_feedback(feedback.text, feedback.source)

        process_single_feedback(feedback_id, feedback.text)

        result = get_feedback_by_id(feedback_id)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to retrieve processed feedback")

        # Notion integration removed, no posting to Notion

        return FeedbackResponse(**result)
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[FeedbackResponse])
async def list_feedback():
    try:
        feedback_list = get_all_feedback()
        return [FeedbackResponse(**item) for item in feedback_list]
    except Exception as e:
        logger.error(f"Error listing feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(feedback_id: int):
    try:
        result = get_feedback_by_id(feedback_id)
        if not result:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return FeedbackResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{feedback_id}", status_code=204)
async def delete_feedback_endpoint(feedback_id: int):
    try:
        success = delete_feedback(feedback_id)
        if not success:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")

        contents = await file.read()
        csv_file = io.StringIO(contents.decode('utf-8'))
        csv_reader = csv.DictReader(csv_file)

        processed_count = 0
        for row in csv_reader:
            if 'text' in row or 'feedback' in row:
                text = row.get('text') or row.get('feedback')
                source = row.get('source', 'csv_upload')

                if text and text.strip():
                    feedback_id = insert_feedback(text, source)
                    process_single_feedback(feedback_id, text)
                    processed_count += 1

        return {
            "message": f"Successfully processed {processed_count} feedback entries",
            "count": processed_count
        }
    except Exception as e:
        logger.error(f"Error uploading CSV: {e}")
        raise HTTPException(status_code=500, detail=str(e))
