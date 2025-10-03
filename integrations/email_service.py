import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List

logger = logging.getLogger(__name__)


class EmailIntegration:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL")
        self.sender_password = os.getenv("SENDER_PASSWORD")
        
        if self.sender_email and self.sender_password:
            logger.info("Email integration initialized")
        else:
            logger.warning("Email credentials not set. Email integration disabled.")
    
    def is_configured(self) -> bool:
        return bool(self.sender_email and self.sender_password)
    
    def send_report(self, recipients: List[str], report: str, subject: str = "Weekly Feedback Priority Report") -> bool:
        if not self.is_configured():
            logger.error("Email not configured. Cannot send report.")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = ", ".join(recipients)
            
            plain_text = report
            html_version = f"<html><body><pre>{report}</pre></body></html>"
            
            part1 = MIMEText(plain_text, "plain")
            part2 = MIMEText(html_version, "html")
            
            message.attach(part1)
            message.attach(part2)
            
            attachment = MIMEBase("application", "octet-stream")
            attachment.set_payload(report.encode())
            encoders.encode_base64(attachment)
            attachment.add_header(
                "Content-Disposition",
                f"attachment; filename=feedback_report.md"
            )
            message.attach(attachment)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, recipients, message.as_string())
            
            logger.info(f"Report sent to {len(recipients)} recipients")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
