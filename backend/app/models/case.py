from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class CaseDocument(Base):
    __tablename__ = "case_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(100))
    file_size = Column(Integer)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="documents")
    uploaded_by = relationship("User")


class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    case_type = Column(String(100))  # civil, laboral, penal, administrativo
    jurisdiction = Column(String(100))  # CGP, CPACA
    court_name = Column(String(255))
    judge_name = Column(String(255))
    opposing_party = Column(String(255))
    client_name = Column(String(255))
    client_email = Column(String(255))
    client_phone = Column(String(20))
    status = Column(String(50), default="active")  # active, suspended, archived, closed
    assigned_lawyer_id = Column(Integer, ForeignKey("users.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"))
    extra_data = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    assigned_lawyer = relationship("User", back_populates="assigned_cases", foreign_keys=[assigned_lawyer_id])
    created_by = relationship("User", back_populates="created_cases", foreign_keys=[created_by_id])
    actions = relationship("Action", back_populates="case", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="case", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="case")
    documents = relationship("CaseDocument", back_populates="case", cascade="all, delete-orphan")
