from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class Action(Base):
    __tablename__ = "actions"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    action_type = Column(String(100), nullable=False)  # demanda, contestacion, audiencia, recurso
    title = Column(String(500), nullable=False)
    description = Column(Text)
    action_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending")  # pending, completed, overdue
    created_by_id = Column(Integer, ForeignKey("users.id"))
    extra_data = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    case = relationship("Case", back_populates="actions")
    created_by = relationship("User", back_populates="actions")
    documents = relationship("ActionDocument", back_populates="action", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="action")


class ActionDocument(Base):
    __tablename__ = "action_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(Integer, ForeignKey("actions.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50))  # pdf, docx, jpg
    file_size = Column(Integer)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    action = relationship("Action", back_populates="documents")
    uploaded_by = relationship("User")
