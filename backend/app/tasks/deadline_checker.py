from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.deadline import Deadline
from app.models.case import Case
from app.models.user import User
from app.services.notification_service import NotificationService


def _get_celery_app():
    from app.tasks.celery_app import celery_app
    return celery_app


def check_upcoming_deadlines():
    import asyncio
    
    async def _check():
        async with AsyncSessionLocal() as db:
            try:
                now = datetime.now(timezone.utc)
                limit_date = now + timedelta(days=5)
                
                result = await db.execute(
                    select(Deadline).where(
                        Deadline.due_date <= limit_date,
                        Deadline.status == "pending"
                    )
                )
                deadlines = result.scalars().all()
                
                notification_service = NotificationService(db)
                notifications_sent = 0
                
                for deadline in deadlines:
                    days_remaining = (deadline.due_date.date() - now.date()).days
                    
                    if days_remaining < 0:
                        deadline.status = "overdue"
                        continue
                    
                    notifications_sent_data = deadline.notifications_sent or []
                    
                    if days_remaining in [5, 3, 1] and days_remaining not in notifications_sent_data:
                        case = await db.get(Case, deadline.case_id)
                        user = await db.get(User, deadline.assigned_to_id)
                        
                        if case and user:
                            await notification_service.send_deadline_warning(
                                deadline_id=deadline.id,
                                user_id=user.id,
                                case_number=case.case_number,
                                deadline_title=deadline.title,
                                due_date=deadline.due_date,
                                days_remaining=days_remaining
                            )
                            
                            notifications_sent_data.append(days_remaining)
                            deadline.notifications_sent = notifications_sent_data
                            notifications_sent += 1
                
                await db.commit()
                
                return {
                    "success": True,
                    "deadlines_checked": len(deadlines),
                    "notifications_sent": notifications_sent
                }
            
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}
    
    return asyncio.run(_check())


def mark_overdue_deadlines():
    import asyncio
    
    async def _mark():
        async with AsyncSessionLocal() as db:
            try:
                now = datetime.now(timezone.utc)
                
                result = await db.execute(
                    select(Deadline).where(
                        Deadline.due_date < now,
                        Deadline.status == "pending"
                    )
                )
                overdue_deadlines = result.scalars().all()
                
                for deadline in overdue_deadlines:
                    deadline.status = "overdue"
                
                await db.commit()
                
                return {
                    "success": True,
                    "overdue_count": len(overdue_deadlines)
                }
            
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}
    
    return asyncio.run(_mark())
