from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    case_type: Optional[str] = None
    jurisdiction: Optional[str] = "CGP"
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    opposing_party: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None


class CaseCreate(CaseBase):
    assigned_lawyer_id: Optional[int] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[str] = None
    jurisdiction: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    opposing_party: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    status: Optional[str] = None
    assigned_lawyer_id: Optional[int] = None


class CaseAssign(BaseModel):
    lawyer_id: int


class CaseResponse(CaseBase):
    id: int
    case_number: str
    status: str
    assigned_lawyer_id: Optional[int] = None
    created_by_id: Optional[int] = None
    extra_data: Optional[Dict[str, Any]] = {}
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    cases: List[CaseResponse]
    total: int
    page: int
    per_page: int


class CaseDocumentResponse(BaseModel):
    id: int
    file_name: str
    file_url: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_by_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
