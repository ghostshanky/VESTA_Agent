import os
import logging
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

logger = logging.getLogger(__name__)


class SlackIntegration:
    def __init__(self):
        self.token = os.getenv("SLACK_BOT_TOKEN")
        self.channel = os.getenv("SLACK_CHANNEL", "#feedback-reports")
        self.client = None
        
        if self.token:
            self.client = WebClient(token=self.token)
            logger.info("Slack integration initialized")
        else:
            logger.warning("SLACK_BOT_TOKEN not set. Slack integration disabled.")
    
    def is_configured(self) -> bool:
        return self.client is not None
    
    def post_report(self, report: str) -> bool:
        if not self.is_configured():
            logger.error("Slack not configured. Cannot post report.")
            return False
        
        try:
            response = self.client.chat_postMessage(
                channel=self.channel,
                text="📊 *Weekly Feedback Priority Report*",
                blocks=[
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "📊 Weekly Feedback Priority Report"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": report[:3000]
                        }
                    }
                ]
            )
            
            logger.info(f"Report posted to Slack channel {self.channel}")
            return True
        except SlackApiError as e:
            logger.error(f"Slack API error: {e.response['error']}")
            return False
        except Exception as e:
            logger.error(f"Failed to post to Slack: {e}")
            return False
