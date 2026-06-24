from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.services.notification_service import NotificationService
from app.models.case import Case
from app.models.deadline import Deadline
from app.models.user import User


def send_assignment_notification_task(
    lawyer_id: int,
    case_id: int
):
    import asyncio
    
    async def _send():
        async with AsyncSessionLocal() as db:
            try:
                case = await db.get(Case, case_id)
                lawyer = await db.get(User, lawyer_id)
                
                if not case or not lawyer:
                    return {"error": "Caso o abogado no encontrado"}
                
                notification_service = NotificationService(db)
                notifications = await notification_service.send_assignment_notification(
                    lawyer_id=lawyer_id,
                    case_id=case_id,
                    case_number=case.case_number,
                    case_title=case.title,
                    court_name=case.court_name or "No especificado"
                )
                
                await db.commit()
                
                return {
                    "success": True,
                    "notifications_sent": len(notifications)
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}
    
    return asyncio.run(_send())


def send_deadline_warning_task(
    deadline_id: int,
    days_remaining: int
):
    import asyncio
    
    async def _send():
        async with AsyncSessionLocal() as db:
            try:
                deadline = await db.get(Deadline, deadline_id)
                if not deadline:
                    return {"error": "Vencimiento no encontrado"}
                
                case = await db.get(Case, deadline.case_id)
                user = await db.get(User, deadline.assigned_to_id)
                
                if not case or not user:
                    return {"error": "Caso o usuario no encontrado"}
                
                notification_service = NotificationService(db)
                notifications = await notification_service.send_deadline_warning(
                    deadline_id=deadline_id,
                    user_id=user.id,
                    case_number=case.case_number,
                    deadline_title=deadline.title,
                    due_date=deadline.due_date,
                    days_remaining=days_remaining
                )
                
                await db.commit()
                
                return {
                    "success": True,
                    "notifications_sent": len(notifications)
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}
    
    return asyncio.run(_send())


def process_notification_webhook(
    provider: str,
    message_id: str,
    status: str,
    webhook_metadata: dict
):
    import asyncio
    
    async def _process():
        async with AsyncSessionLocal() as db:
            from sqlalchemy import select
            from app.models.notification import Notification, NotificationLog
            
            result = await db.execute(
                select(NotificationLog).where(
                    NotificationLog.provider == provider,
                    NotificationLog.provider_message_id == message_id
                )
            )
            log = result.scalar_one_or_none()
            
            if log:
                notification = await db.get(Notification, log.notification_id)
                if notification:
                    notification.status = status
                    if status == "delivered":
                        notification.extra_data["delivered_at"] = webhook_metadata.get("timestamp")
                    
                    log.extra_data = {**(log.extra_data or {}), **webhook_metadata}
                    await db.commit()
            
            return {"processed": True}
    
    return asyncio.run(_process())
