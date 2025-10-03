import sqlite3
import logging
from datetime import datetime
from contextlib import contextmanager
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

DB_PATH = "customer_feedback.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        conn.close()


def init_db():
    logger.info("Initializing database...")
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                source TEXT DEFAULT 'manual',
                sentiment TEXT,
                theme TEXT,
                summary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feedback_id INTEGER NOT NULL,
                urgency INTEGER NOT NULL,
                impact INTEGER NOT NULL,
                justification TEXT NOT NULL,
                priority_score REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (feedback_id) REFERENCES feedback (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                markdown_report TEXT NOT NULL
            )
        """)
        
        logger.info("Database initialized successfully")


def insert_feedback(text: str, source: str = "manual") -> int:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (text, source) VALUES (?, ?)",
            (text, source)
        )
        return cursor.lastrowid


def update_feedback_classification(feedback_id: int, sentiment: str, theme: str, summary: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE feedback SET sentiment = ?, theme = ?, summary = ? WHERE id = ?",
            (sentiment, theme, summary, feedback_id)
        )


def insert_score(feedback_id: int, urgency: int, impact: int, justification: str, priority_score: float):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO scores (feedback_id, urgency, impact, justification, priority_score) VALUES (?, ?, ?, ?, ?)",
            (feedback_id, urgency, impact, justification, priority_score)
        )


def get_all_feedback() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                f.id, f.text, f.source, f.sentiment, f.theme, f.summary, f.created_at,
                s.urgency, s.impact, s.justification, s.priority_score
            FROM feedback f
            LEFT JOIN scores s ON f.id = s.feedback_id
            ORDER BY f.created_at DESC
        """)
        return [dict(row) for row in cursor.fetchall()]


def get_feedback_by_id(feedback_id: int) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                f.id, f.text, f.source, f.sentiment, f.theme, f.summary, f.created_at,
                s.urgency, s.impact, s.justification, s.priority_score
            FROM feedback f
            LEFT JOIN scores s ON f.id = s.feedback_id
            WHERE f.id = ?
        """, (feedback_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def insert_report(markdown_report: str) -> int:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO reports (markdown_report) VALUES (?)",
            (markdown_report,)
        )
        return cursor.lastrowid


def get_latest_report() -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, generated_at, markdown_report FROM reports ORDER BY generated_at DESC LIMIT 1"
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def get_all_reports() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, generated_at, markdown_report FROM reports ORDER BY generated_at DESC"
        )
        return [dict(row) for row in cursor.fetchall()]
