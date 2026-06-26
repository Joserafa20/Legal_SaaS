from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.case import Case
from app.models.user import User
from app.schemas.case import CaseCreate, CaseUpdate


class CaseService:
    @staticmethod
    async def generate_case_number(db: AsyncSession) -> str:
        year = datetime.now().year
        result = await db.execute(
            select(func.count(Case.id))
        )
        count = result.scalar() + 1
        return f"{year}-{count:06d}"
    
    @staticmethod
    async def create_case(
        db: AsyncSession,
        case_data: CaseCreate,
        created_by_id: int
    ) -> Case:
        case_number = await CaseService.generate_case_number(db)
        
        case = Case(
            case_number=case_number,
            title=case_data.title,
            description=case_data.description,
            case_type=case_data.case_type,
            jurisdiction=case_data.jurisdiction,
            court_name=case_data.court_name,
            judge_name=case_data.judge_name,
            opposing_party=case_data.opposing_party,
            client_name=case_data.client_name,
            client_email=case_data.client_email,
            client_phone=case_data.client_phone,
            assigned_lawyer_id=case_data.assigned_lawyer_id,
            created_by_id=created_by_id
        )
        db.add(case)
        await db.flush()
        await db.refresh(case)
        return case
    
    @staticmethod
    async def get_case(db: AsyncSession, case_id: int) -> Case:
        result = await db.execute(select(Case).where(Case.id == case_id))
        case = result.scalar_one_or_none()
        if not case:
            raise ValueError("Caso no encontrado")
        return case
    
    @staticmethod
    async def get_cases_by_lawyer(
        db: AsyncSession,
        lawyer_id: int,
        page: int = 1,
        per_page: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[Case], int]:
        query = select(Case).where(Case.assigned_lawyer_id == lawyer_id)
        
        if status:
            query = query.where(Case.status == status)
        
        if search:
            pattern = f"%{search}%"
            query = query.where(
                Case.title.ilike(pattern) |
                Case.description.ilike(pattern) |
                Case.case_number.ilike(pattern) |
                Case.client_name.ilike(pattern) |
                Case.client_email.ilike(pattern)
            )
        
        count_result = await db.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar()
        
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(query)
        cases = result.scalars().all()
        
        return cases, total
    
    @staticmethod
    async def get_cases_by_client_email(
        db: AsyncSession,
        client_email: str,
        page: int = 1,
        per_page: int = 20,
        status: Optional[str] = None
    ) -> tuple[List[Case], int]:
        query = select(Case).where(Case.client_email == client_email)
        
        if status:
            query = query.where(Case.status == status)
        
        count_result = await db.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar()
        
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(query)
        cases = result.scalars().all()
        
        return cases, total
    
    @staticmethod
    async def get_all_cases(
        db: AsyncSession,
        page: int = 1,
        per_page: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[Case], int]:
        query = select(Case)
        
        if status:
            query = query.where(Case.status == status)
        
        if search:
            pattern = f"%{search}%"
            query = query.where(
                Case.title.ilike(pattern) |
                Case.description.ilike(pattern) |
                Case.case_number.ilike(pattern) |
                Case.client_name.ilike(pattern) |
                Case.client_email.ilike(pattern)
            )
        
        count_result = await db.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar()
        
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(query)
        cases = result.scalars().all()
        
        return cases, total
    
    @staticmethod
    async def update_case(
        db: AsyncSession,
        case_id: int,
        case_data: CaseUpdate
    ) -> Case:
        case = await CaseService.get_case(db, case_id)
        
        update_data = case_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(case, field, value)
        
        case.updated_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(case)
        return case
    
    @staticmethod
    async def assign_case(
        db: AsyncSession,
        case_id: int,
        lawyer_id: int
    ) -> Case:
        case = await CaseService.get_case(db, case_id)
        
        lawyer = await db.get(User, lawyer_id)
        if not lawyer:
            raise ValueError("Abogado no encontrado")
        
        case.assigned_lawyer_id = lawyer_id
        case.updated_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(case)
        return case
