from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class DeadlineBase(BaseModel):
    title: str
    start_date: datetime
    due_date: datetime
    assigned_to_id: Optional[int] = None


class DeadlineCreate(DeadlineBase):
    case_id: int
    action_id: Optional[int] = None
    legal_term_id: Optional[int] = None


class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    extended_days: Optional[int] = None
    extension_reason: Optional[str] = None


class DeadlineExtend(BaseModel):
    additional_days: int
    reason: str


class DeadlineResponse(DeadlineBase):
    id: int
    case_id: int
    action_id: Optional[int] = None
    legal_term_id: Optional[int] = None
    status: str
    extended_days: int
    notifications_sent: List[Dict] = []
    created_at: datetime
    
    class Config:
        from_attributes = True


class DeadlineListResponse(BaseModel):
    deadlines: List[DeadlineResponse]
    total: int


class UpcomingDeadlineResponse(BaseModel):
    id: int
    case_id: int
    case_number: str
    case_title: str
    title: str
    due_date: datetime
    days_remaining: int
    urgency: str  # warning, urgent, critical
    assigned_to_name: str
