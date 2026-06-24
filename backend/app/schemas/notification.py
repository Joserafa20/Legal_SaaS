from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class NotificationBase(BaseModel):
    channel: str  # email, whatsapp, push
    event_type: str
    subject: Optional[str] = None
    body: str


class NotificationCreate(NotificationBase):
    user_id: int
    case_id: Optional[int] = None
    deadline_id: Optional[int] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    case_id: Optional[int] = None
    deadline_id: Optional[int] = None
    status: str
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    metadata: Optional[Dict] = {}
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


class SendNotificationRequest(BaseModel):
    user_id: int
    case_id: Optional[int] = None
    channel: str
    event_type: str
    subject: Optional[str] = None
    message: str
