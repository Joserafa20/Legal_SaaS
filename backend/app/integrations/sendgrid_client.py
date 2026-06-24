from typing import Optional
from app.core.config import settings

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent
    SENDGRID_AVAILABLE = True
except ImportError:
    SendGridAPIClient = None
    SENDGRID_AVAILABLE = False


class SendGridClient:
    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.SENDGRID_FROM_EMAIL
        self.from_name = settings.SENDGRID_FROM_NAME
        self.client = None
        
        if SENDGRID_AVAILABLE and self.api_key:
            self.client = SendGridAPIClient(self.api_key)
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None
    ) -> dict:
        if not self.client:
            raise ValueError("SendGrid client no configurado")
        
        message = Mail(
            from_email=Email(self.from_email, self.from_name),
            to_emails=To(to),
            subject=subject,
            html_content=HtmlContent(html_content)
        )
        
        if plain_text:
            message.plain_text_content = Content("text/plain", plain_text)
        
        try:
            response = self.client.send(message)
            return {
                "status_code": response.status_code,
                "message_id": response.headers.get("X-Message-Id"),
                "success": 200 <= response.status_code < 300
            }
        except Exception as e:
            raise ValueError(f"Error enviando email: {str(e)}")
    
    async def send_template_email(
        self,
        to: str,
        template_id: str,
        dynamic_data: dict
    ) -> dict:
        if not self.client:
            raise ValueError("SendGrid client no configurado")
        
        message = Mail(
            from_email=Email(self.from_email, self.from_name),
            to_emails=To(to)
        )
        message.template_id = template_id
        message.dynamic_template_data = dynamic_data
        
        try:
            response = self.client.send(message)
            return {
                "status_code": response.status_code,
                "message_id": response.headers.get("X-Message-Id"),
                "success": 200 <= response.status_code < 300
            }
        except Exception as e:
            raise ValueError(f"Error enviando email: {str(e)}")


sendgrid_client = SendGridClient()
