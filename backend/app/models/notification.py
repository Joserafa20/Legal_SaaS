from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    case_id = Column(Integer, ForeignKey("cases.id"))
    deadline_id = Column(Integer, ForeignKey("deadlines.id"))
    channel = Column(String(20), nullable=False)  # email, whatsapp, push
    event_type = Column(String(100), nullable=False)  # assignment, deadline_warning, deadline_urgent
    subject = Column(String(500))
    body = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, sent, failed, read
    sent_at = Column(DateTime)
    read_at = Column(DateTime)
    extra_data = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="notifications")
    case = relationship("Case", back_populates="notifications")
    logs = relationship("NotificationLog", back_populates="notification", cascade="all, delete-orphan")


class NotificationLog(Base):
    __tablename__ = "notification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("notifications.id"))
    provider = Column(String(50))  # twilio, sendgrid, ses
    provider_message_id = Column(String(255))
    extra_data = Column("response", JSON)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    notification = relationship("Notification", back_populates="logs")
