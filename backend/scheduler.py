import os
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.db import get_all_feedback, insert_report
from backend.crew_pipeline import generate_priority_report
from integrations.slack import SlackIntegration
from integrations.email_service import EmailIntegration
from integrations.notion import NotionIntegration

logger = logging.getLogger(__name__)


def generate_and_distribute_report():
    logger.info("Starting scheduled report generation...")
    
    try:
        feedback_list = get_all_feedback()
        markdown_report = generate_priority_report(feedback_list)
        
        insert_report(markdown_report)
        
        os.makedirs("reports", exist_ok=True)
        filename = f"reports/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.md"
        with open(filename, 'w') as f:
            f.write(markdown_report)
        logger.info(f"Report saved to {filename}")
        
        slack = SlackIntegration()
        if slack.is_configured():
            slack.post_report(markdown_report)
        
        email = EmailIntegration()
        if email.is_configured():
            recipients = os.getenv("EMAIL_RECIPIENTS", "").split(",")
            recipients = [r.strip() for r in recipients if r.strip()]
            if recipients:
                email.send_report(recipients, markdown_report)
        
        notion = NotionIntegration()
        if notion.is_configured():
            title = f"Weekly Feedback Report - {datetime.now().strftime('%Y-%m-%d')}"
            notion.post_report_sync(title, markdown_report)
        
        logger.info("Scheduled report generation completed successfully")
    except Exception as e:
        logger.error(f"Failed to generate scheduled report: {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    
    cron_schedule = os.getenv("REPORT_CRON", "0 9 * * 1")
    
    scheduler.add_job(
        generate_and_distribute_report,
        trigger=CronTrigger.from_crontab(cron_schedule),
        id="weekly_report",
        name="Generate Weekly Feedback Report",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info(f"Scheduler started with cron: {cron_schedule}")
    
    return scheduler
