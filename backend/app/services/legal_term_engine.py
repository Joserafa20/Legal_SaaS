from datetime import datetime, timedelta, date, timezone
from typing import List, Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.deadline import Deadline, LegalTerm
from app.models.holiday import ColombianHoliday


class ColombianLegalTermEngine:
    """
    Motor de cálculo de términos procesales colombianos
    Basado en Código General del Proceso (CGP) y CPACA
    """
    
    TERMS_CONFIG = {
        "CGP": {
            "contestacion_demanda": {
                "days": 30,
                "type": "habiles",
                "ref": "Art. 315 CGP",
                "description": "Término para contestar demanda"
            },
            "recurso_apelacion": {
                "days": 10,
                "type": "habiles",
                "ref": "Art. 348 CGP",
                "description": "Término para interponer apelación"
            },
            "recurso_casacion": {
                "days": 30,
                "type": "calendario",
                "ref": "Art. 359 CGP",
                "description": "Término para interponer casación"
            },
            "alegatos_conclusion": {
                "days": 15,
                "type": "habiles",
                "ref": "Art. 371 CGP",
                "description": "Término para alegatos de conclusión"
            },
            "tutela": {
                "days": 10,
                "type": "calendario",
                "ref": "Art. 86 C.P.",
                "description": "Término para interponer tutela"
            },
            "perencion_instancia": {
                "days": 365,
                "type": "calendario",
                "ref": "Art. 346 CGP",
                "description": "Perención de instancia"
            },
            "suplicatorio": {
                "days": 10,
                "type": "habiles",
                "ref": "Art. 330 CGP",
                "description": "Término del suplicatorio"
            },
            "apelacion_sentencia": {
                "days": 30,
                "type": "calendario",
                "ref": "Art. 347 CGP",
                "description": "Apelación de sentencia"
            },
        },
        "CPACA": {
            "contestacion_demanda": {
                "days": 30,
                "type": "habiles",
                "ref": "Art. 161 CPACA",
                "description": "Término para contestar demanda contencioso-administrativa"
            },
            "recurso_apelacion": {
                "days": 10,
                "type": "habiles",
                "ref": "Art. 243 CPACA",
                "description": "Término para apelación en CA"
            },
            "demanda_repeticion": {
                "days": 30,
                "type": "habiles",
                "ref": "Art. 161 CPACA",
                "description": "Término para demanda de repetición"
            },
            "recision": {
                "days": 10,
                "type": "habiles",
                "ref": "Art. 175 CPACA",
                "description": "Término para pedir revocación directa"
            },
        }
    }
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self._holidays: Optional[List[date]] = None
    
    async def _load_holidays(self) -> List[date]:
        if self._holidays is None:
            result = await self.db.execute(select(ColombianHoliday.date))
            self._holidays = [row[0] for row in result.all()]
        return self._holidays
    
    async def _is_business_day(self, check_date: date) -> bool:
        holidays = await self._load_holidays()
        
        if check_date.weekday() >= 5:
            return False
        
        if check_date in holidays:
            return False
        
        return True
    
    async def _next_business_day(self, check_date: date) -> date:
        next_day = check_date + timedelta(days=1)
        while not await self._is_business_day(next_day):
            next_day += timedelta(days=1)
        return next_day
    
    async def calculate_deadline(
        self,
        start_date: datetime,
        term_days: int,
        term_type: str = "habiles"
    ) -> datetime:
        start = start_date.date() if isinstance(start_date, datetime) else start_date
        
        if term_type == "habiles":
            return await self._calc_business_days(start, term_days)
        elif term_type == "calendario":
            return await self._calc_calendar_days(start, term_days)
        elif term_type == "mismo_dia":
            return datetime.combine(start, datetime.min.time())
        else:
            raise ValueError(f"Tipo de término no válido: {term_type}")
    
    async def _calc_business_days(self, start: date, days: int) -> datetime:
        current = await self._next_business_day(start)
        counted = 1
        
        while counted < days:
            current = await self._next_business_day(current)
            counted += 1
        
        return datetime.combine(current, datetime.min.time())
    
    async def _calc_calendar_days(self, start: date, days: int) -> datetime:
        current = start
        remaining = days
        
        while remaining > 0:
            current += timedelta(days=1)
            if await self._is_business_day(current):
                remaining -= 1
        
        return datetime.combine(current, datetime.min.time())
    
    def get_term_config(
        self,
        jurisdiction: str,
        action_type: str
    ) -> Optional[Dict]:
        return self.TERMS_CONFIG.get(jurisdiction, {}).get(action_type)
    
    async def create_deadline(
        self,
        case_id: int,
        action_type: str,
        start_date: datetime,
        assigned_to_id: int,
        jurisdiction: str = "CGP",
        action_id: Optional[int] = None
    ) -> Deadline:
        config = self.get_term_config(jurisdiction, action_type)
        if not config:
            raise ValueError(f"Tipo de actuación no configurado: {action_type}")
        
        due_date = await self.calculate_deadline(
            start_date=start_date,
            term_days=config["days"],
            term_type=config["type"]
        )
        
        deadline = Deadline(
            case_id=case_id,
            action_id=action_id,
            title=config["description"],
            start_date=start_date,
            due_date=due_date,
            assigned_to_id=assigned_to_id
        )
        
        self.db.add(deadline)
        await self.db.flush()
        await self.db.refresh(deadline)
        
        return deadline
    
    async def extend_deadline(
        self,
        deadline_id: int,
        additional_days: int,
        reason: str
    ) -> Deadline:
        result = await self.db.execute(
            select(Deadline).where(Deadline.id == deadline_id)
        )
        deadline = result.scalar_one_or_none()
        
        if not deadline:
            raise ValueError("Vencimiento no encontrado")
        
        new_due_date = deadline.due_date + timedelta(days=additional_days)
        
        deadline.due_date = new_due_date
        deadline.extended_days += additional_days
        deadline.extension_reason = reason
        
        await self.db.flush()
        await self.db.refresh(deadline)
        
        return deadline
    
    async def get_upcoming_deadlines(
        self,
        days_ahead: int = 7,
        lawyer_id: Optional[int] = None,
        client_email: Optional[str] = None
    ) -> List[Dict]:
        from app.models.case import Case
        
        now = datetime.now(timezone.utc)
        limit_date = now + timedelta(days=days_ahead)
        
        query = select(Deadline).where(
            Deadline.due_date <= limit_date,
            Deadline.status == "pending"
        )
        
        if lawyer_id:
            query = query.where(Deadline.assigned_to_id == lawyer_id)
        
        if client_email:
            query = query.join(Deadline.case).where(Case.client_email == client_email)
        
        result = await self.db.execute(query)
        deadlines = result.scalars().all()
        
        upcoming = []
        for deadline in deadlines:
            days_remaining = (deadline.due_date.date() - now.date()).days
            
            if days_remaining <= 1:
                urgency = "critical"
            elif days_remaining <= 3:
                urgency = "urgent"
            else:
                urgency = "warning"
            
            upcoming.append({
                "id": deadline.id,
                "case_id": deadline.case_id,
                "title": deadline.title,
                "due_date": deadline.due_date,
                "days_remaining": max(0, days_remaining),
                "urgency": urgency,
                "assigned_to_id": deadline.assigned_to_id
            })
        
        upcoming.sort(key=lambda x: x["due_date"])
        
        return upcoming
