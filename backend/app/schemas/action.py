from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ActionBase(BaseModel):
    action_type: str
    title: str
    description: Optional[str] = None
    action_date: datetime


class ActionCreate(ActionBase):
    case_id: int


class ActionUpdate(BaseModel):
    action_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    action_date: Optional[datetime] = None
    status: Optional[str] = None


class ActionDocumentResponse(BaseModel):
    id: int
    file_name: str
    file_url: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ActionResponse(ActionBase):
    id: int
    case_id: int
    status: str
    created_by_id: Optional[int] = None
    documents: List[ActionDocumentResponse] = []
    created_at: datetime
    
    class Config:
        from_attributes = True


class ActionListResponse(BaseModel):
    actions: List[ActionResponse]
    total: int
