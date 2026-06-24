from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.services.legal_term_engine import ColombianLegalTermEngine
from app.models.case import Case
from app.models.user import User
from app.schemas.deadline import (
    DeadlineCreate, DeadlineUpdate, DeadlineExtend,
    DeadlineResponse, DeadlineListResponse, UpcomingDeadlineResponse
)

router = APIRouter(prefix="/deadlines", tags=["Vencimientos"])


async def _check_case_access(case_id: int, user: User, db: AsyncSession):
    if user.role.name == "abogado":
        case = await db.get(Case, case_id)
        if not case or case.assigned_lawyer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene acceso a este caso"
            )


@router.get("/case/{case_id}", response_model=DeadlineListResponse)
async def get_case_deadlines(
    case_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    await _check_case_access(case_id, current_user, db)
    from sqlalchemy import select
    from app.models.deadline import Deadline
    
    result = await db.execute(
        select(Deadline)
        .where(Deadline.case_id == case_id)
        .order_by(Deadline.due_date)
    )
    deadlines = result.scalars().all()
    
    return DeadlineListResponse(deadlines=deadlines, total=len(deadlines))


@router.post("", response_model=DeadlineResponse)
async def create_deadline(
    deadline_data: DeadlineCreate,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        engine = ColombianLegalTermEngine(db)
        
        case = await db.get(Case, deadline_data.case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Caso no encontrado"
            )
        
        await _check_case_access(deadline_data.case_id, current_user, db)
        
        deadline = await engine.create_deadline(
            case_id=deadline_data.case_id,
            action_type=deadline_data.title.lower().replace(" ", "_"),
            start_date=deadline_data.start_date,
            assigned_to_id=deadline_data.assigned_to_id or current_user.id,
            jurisdiction=case.jurisdiction or "CGP",
            action_id=deadline_data.action_id
        )
        
        return deadline
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/upcoming", response_model=list[UpcomingDeadlineResponse])
async def get_upcoming_deadlines(
    days_ahead: int = Query(7, ge=1, le=30),
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    engine = ColombianLegalTermEngine(db)
    
    user_id = None if current_user.role.name == "admin" else current_user.id
    
    deadlines = await engine.get_upcoming_deadlines(
        days_ahead=days_ahead,
        lawyer_id=user_id
    )
    
    return deadlines


@router.get("/available-terms")
async def get_available_terms(
    jurisdiction: str = Query("CGP")
):
    engine = ColombianLegalTermEngine.__new__(ColombianLegalTermEngine)
    
    terms = engine.TERMS_CONFIG.get(jurisdiction, {})
    
    return {
        "jurisdiction": jurisdiction,
        "terms": [
            {
                "key": key,
                "days": config["days"],
                "type": config["type"],
                "reference": config["ref"],
                "description": config["description"]
            }
            for key, config in terms.items()
        ]
    }


@router.put("/{deadline_id}/extend", response_model=DeadlineResponse)
async def extend_deadline(
    deadline_id: int,
    extend_data: DeadlineExtend,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        engine = ColombianLegalTermEngine(db)
        deadline = await engine.extend_deadline(
            deadline_id=deadline_id,
            additional_days=extend_data.additional_days,
            reason=extend_data.reason
        )
        return deadline
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{deadline_id}/complete", response_model=DeadlineResponse)
async def complete_deadline(
    deadline_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.models.deadline import Deadline
    
    result = await db.execute(select(Deadline).where(Deadline.id == deadline_id))
    deadline = result.scalar_one_or_none()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vencimiento no encontrado"
        )
    
    await _check_case_access(deadline.case_id, current_user, db)
    
    deadline.status = "completed"
    await db.flush()
    await db.refresh(deadline)
    
    return deadline
