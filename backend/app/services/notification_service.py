from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification, NotificationLog
from app.models.user import User
from app.integrations.twilio_client import TwilioClient
from app.integrations.sendgrid_client import SendGridClient


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.twilio = TwilioClient()
        self.sendgrid = SendGridClient()
    
    async def send_notification(
        self,
        user_id: int,
        channel: str,
        event_type: str,
        subject: Optional[str],
        body: str,
        case_id: Optional[int] = None,
        deadline_id: Optional[int] = None,
        metadata: Optional[dict] = None
    ) -> Notification:
        user = await self.db.get(User, user_id)
        if not user:
            raise ValueError("Usuario no encontrado")
        
        notification = Notification(
            user_id=user_id,
            case_id=case_id,
            deadline_id=deadline_id,
            channel=channel,
            event_type=event_type,
            subject=subject,
            body=body,
            metadata=metadata or {}
        )
        self.db.add(notification)
        await self.db.flush()
        
        try:
            if channel == "whatsapp" and user.phone:
                result = await self.twilio.send_whatsapp(
                    to=user.phone,
                    message=body
                )
                notification.status = "sent"
                notification.sent_at = datetime.now(timezone.utc)
                
                log = NotificationLog(
                    notification_id=notification.id,
                    provider="twilio",
                    provider_message_id=result.get("sid"),
                    response=result
                )
                self.db.add(log)
            
            elif channel == "email":
                result = await self.sendgrid.send_email(
                    to=user.email,
                    subject=subject or "Notificación Legal SaaS",
                    html_content=body
                )
                notification.status = "sent"
                notification.sent_at = datetime.now(timezone.utc)
                
                log = NotificationLog(
                    notification_id=notification.id,
                    provider="sendgrid",
                    provider_message_id=result.get("message_id"),
                    response=result
                )
                self.db.add(log)
            
            else:
                notification.status = "failed"
                notification.extra_data["error"] = "Canal no disponible o usuario sin teléfono"
        
        except Exception as e:
            notification.status = "failed"
            notification.extra_data["error"] = str(e)
        
        await self.db.flush()
        await self.db.refresh(notification)
        
        return notification
    
    async def send_assignment_notification(
        self,
        lawyer_id: int,
        case_id: int,
        case_number: str,
        case_title: str,
        court_name: str
    ) -> list[Notification]:
        notifications = []
        
        whatsapp_message = (
            f"📋 *Nuevo Caso Asignado*\n\n"
            f"N° Radicado: {case_number}\n"
            f"Caso: {case_title}\n"
            f"Juzgado: {court_name}\n\n"
            f"Por favor revise los detalles en la aplicación."
        )
        
        email_subject = f"Nuevo caso asignado: {case_number}"
        email_body = f"""
        <h2>Nuevo Caso Asignado</h2>
        <p><strong>Número de Radicado:</strong> {case_number}</p>
        <p><strong>Caso:</strong> {case_title}</p>
        <p><strong>Juzgado:</strong> {court_name}</p>
        <p>Por favor revise los detalles en la plataforma.</p>
        """
        
        try:
            notif_whatsapp = await self.send_notification(
                user_id=lawyer_id,
                channel="whatsapp",
                event_type="assignment",
                subject=email_subject,
                body=whatsapp_message,
                case_id=case_id
            )
            notifications.append(notif_whatsapp)
        except Exception:
            pass
        
        try:
            notif_email = await self.send_notification(
                user_id=lawyer_id,
                channel="email",
                event_type="assignment",
                subject=email_subject,
                body=email_body,
                case_id=case_id
            )
            notifications.append(notif_email)
        except Exception:
            pass
        
        return notifications
    
    async def send_deadline_warning(
        self,
        deadline_id: int,
        user_id: int,
        case_number: str,
        deadline_title: str,
        due_date: datetime,
        days_remaining: int
    ) -> list[Notification]:
        notifications = []
        
        urgency = "URGENTE" if days_remaining <= 1 else "ALERTA"
        
        whatsapp_message = (
            f"⚠️ *{urgency}: Vencimiento en {days_remaining} día(s)*\n\n"
            f"Caso: {case_number}\n"
            f"Término: {deadline_title}\n"
            f"Fecha límite: {due_date.strftime('%d/%m/%Y')}\n\n"
            f"Por favor tome las acciones necesarias."
        )
        
        email_subject = f"{urgency}: Vence en {days_remaining} día(s) - {deadline_title}"
        email_body = f"""
        <h2 style="color: {'red' if days_remaining <= 1 else 'orange'}">
            {urgency}: Vencimiento en {days_remaining} día(s)
        </h2>
        <p><strong>Caso:</strong> {case_number}</p>
        <p><strong>Término:</strong> {deadline_title}</p>
        <p><strong>Fecha límite:</strong> {due_date.strftime('%d/%m/%Y')}</p>
        <p>Por favor tome las acciones necesarias antes del vencimiento.</p>
        """
        
        try:
            notif_whatsapp = await self.send_notification(
                user_id=user_id,
                channel="whatsapp",
                event_type=f"deadline_{'urgent' if days_remaining <= 1 else 'warning'}",
                subject=email_subject,
                body=whatsapp_message,
                deadline_id=deadline_id
            )
            notifications.append(notif_whatsapp)
        except Exception:
            pass
        
        try:
            notif_email = await self.send_notification(
                user_id=user_id,
                channel="email",
                event_type=f"deadline_{'urgent' if days_remaining <= 1 else 'warning'}",
                subject=email_subject,
                body=email_body,
                deadline_id=deadline_id
            )
            notifications.append(notif_email)
        except Exception:
            pass
        
        return notifications
