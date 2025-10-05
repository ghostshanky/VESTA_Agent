import os
import logging
import smtplib
from email.message import EmailMessage
from typing import Dict, Any
from backend.markdown_to_html import convert_markdown_to_html

logger = logging.getLogger(__name__)

class EmailIntegration:
    def __init__(self):
        self.admin_email = "kunal.sable24+admin@vit.edu"
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.sender_email = os.getenv("SMTP_USER", self.admin_email)  # Use SMTP_USER as sender, fallback to admin_email

        if self.smtp_user and self.smtp_password:
            logger.info("Email integration initialized")
        else:
            logger.warning("SMTP credentials not set. Email integration disabled.")

    def send_report_email(self, subject: str, body: str) -> bool:
        if not (self.smtp_user and self.smtp_password):
            logger.error("SMTP credentials missing. Cannot send email.")
            return False

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.smtp_user
        msg["To"] = self.admin_email
        msg.set_content(body)

        # Convert markdown report to HTML
        html_body = convert_markdown_to_html(body)

        # Add admin panel link and footer with logo to email body
        admin_panel_link = "http://localhost:5000"  # Adjust as needed
        logo_url = "https://drive.google.com/uc?export=view&id=1eoSWCh9iFBwHLo4d7S13kX5bSh7WUjkU"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 700px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h1 style="color: #2c3e50; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">Weekly Feedback Priority Report</h1>
                    <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
                        {html_body}
                    </div>
                    <p style="margin-top: 30px; font-size: 14px; color: #2980b9;">
                        Access the <a href="{admin_panel_link}" style="color: #2980b9; text-decoration: none; font-weight: bold;">Admin Panel</a> to view all statistics and feedback analysis.
                    </p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;" />
                    <div style="text-align: center; color: #95a5a6; font-size: 12px;">
                        <img src="{logo_url}" alt="VESTA Agent Logo" style="width: 120px; margin-bottom: 10px;" />
                        <p>This message is automatically delivered by <strong>VESTA Agent</strong>.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        msg.add_alternative(html_content, subtype='html')

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            logger.info(f"Report email sent to {self.admin_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send report email: {e}")
            return False
