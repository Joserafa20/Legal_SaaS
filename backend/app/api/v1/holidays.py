from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.holiday import ColombianHoliday
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/holidays", tags=["Festivos"])


class HolidayResponse(BaseModel):
    id: int
    date: date
    name: str
    type: str | None

    model_config = {"from_attributes": True}


@router.get("", response_model=list[HolidayResponse])
async def list_holidays(
    start_date: date = Query(..., description="Fecha inicio"),
    end_date: date = Query(..., description="Fecha fin"),
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ColombianHoliday)
        .where(ColombianHoliday.date >= start_date, ColombianHoliday.date <= end_date)
        .order_by(ColombianHoliday.date)
    )
    return result.scalars().all()
