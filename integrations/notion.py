import os
import logging
import httpx
from typing import Dict, Any

logger = logging.getLogger(__name__)


class NotionIntegration:
    def __init__(self):
        self.api_key = os.getenv("NOTION_API_KEY")
        self.database_id = os.getenv("NOTION_DATABASE_ID")
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        if self.api_key and self.database_id:
            logger.info("Notion integration initialized")
        else:
            logger.warning("Notion credentials not set. Notion integration disabled.")
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.database_id)
    
    async def create_page(self, title: str, content: str) -> bool:
        if not self.is_configured():
            logger.error("Notion not configured. Cannot create page.")
            return False
        
        try:
            data = {
                "parent": {"database_id": self.database_id},
                "properties": {
                    "Name": {
                        "title": [
                            {
                                "text": {
                                    "content": title
                                }
                            }
                        ]
                    }
                },
                "children": [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": content[:2000]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/pages",
                    headers=self.headers,
                    json=data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    logger.info("Report posted to Notion")
                    return True
                else:
                    logger.error(f"Notion API error: {response.status_code} - {response.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to post to Notion: {e}")
            return False
    
    def post_report_sync(self, title: str, report: str) -> bool:
        import asyncio
        return asyncio.run(self.create_page(title, report))
