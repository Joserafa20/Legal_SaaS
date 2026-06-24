from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class LegalTerm(Base):
    __tablename__ = "legal_terms"
    
    id = Column(Integer, primary_key=True, index=True)
    jurisdiction = Column(String(100), nullable=False)  # CGP, CPACA
    term_name = Column(String(255), nullable=False)
    description = Column(Text)
    base_days = Column(Integer, nullable=False)
    term_type = Column(String(50))  # absoluto, personal, mixto
    calculation_method = Column(String(50))  # habiles, calendario, notificacion
    applies_to = Column(JSON, default=list)  # Tipos de actuaciones aplicables
    article_reference = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Deadline(Base):
    __tablename__ = "deadlines"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"))
    action_id = Column(Integer, ForeignKey("actions.id"))
    legal_term_id = Column(Integer, ForeignKey("legal_terms.id"))
    title = Column(String(500), nullable=False)
    start_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending")  # pending, completed, extended, overdue
    extended_days = Column(Integer, default=0)
    extension_reason = Column(Text)
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    notifications_sent = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    case = relationship("Case", back_populates="deadlines")
    action = relationship("Action", back_populates="deadlines")
    legal_term = relationship("LegalTerm")
    assigned_to = relationship("User")
