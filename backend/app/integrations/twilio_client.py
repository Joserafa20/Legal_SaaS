from typing import Optional
from app.core.config import settings

try:
    from twilio.rest import Client as TwilioRestClient
    TWILIO_AVAILABLE = True
except ImportError:
    TwilioRestClient = None
    TWILIO_AVAILABLE = False


class TwilioClient:
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.whatsapp_number = settings.TWILIO_WHATSAPP_NUMBER
        self.client = None
        
        if TWILIO_AVAILABLE and self.account_sid and self.auth_token:
            self.client = TwilioRestClient(self.account_sid, self.auth_token)
    
    async def send_whatsapp(
        self,
        to: str,
        message: str,
        media_url: Optional[str] = None
    ) -> dict:
        if not self.client:
            raise ValueError("Twilio client no configurado")
        
        from_number = f"whatsapp:{self.whatsapp_number}"
        to_number = f"whatsapp:{to}" if not to.startswith("whatsapp:") else to
        
        kwargs = {
            "from_": from_number,
            "to": to_number,
            "body": message
        }
        
        if media_url:
            kwargs["media_url"] = [media_url]
        
        try:
            message = self.client.messages.create(**kwargs)
            return {
                "sid": message.sid,
                "status": message.status,
                "to": message.to
            }
        except Exception as e:
            raise ValueError(f"Error enviando WhatsApp: {str(e)}")
    
    async def get_message_status(self, message_sid: str) -> dict:
        if not self.client:
            raise ValueError("Twilio client no configurado")
        
        message = self.client.messages(message_sid).fetch()
        return {
            "sid": message.sid,
            "status": message.status,
            "error_code": message.error_code,
            "error_message": message.error_message
        }


twilio_client = TwilioClient()
