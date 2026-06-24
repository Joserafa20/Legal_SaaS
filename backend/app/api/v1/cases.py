import os, uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.services.case_service import CaseService
from app.services.notification_service import NotificationService
from app.tasks.notification_tasks import send_assignment_notification_task
from app.schemas.case import (
    CaseCreate, CaseUpdate, CaseResponse, 
    CaseListResponse, CaseAssign, CaseDocumentResponse
)
from app.models.case import Case, CaseDocument
from app.models.user import User

router = APIRouter(prefix="/cases", tags=["Casos"])


@router.get("", response_model=CaseListResponse)
async def list_cases(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role.name == "admin":
        cases, total = await CaseService.get_all_cases(db, page, per_page, status)
    else:
        cases, total = await CaseService.get_cases_by_lawyer(db, current_user.id, page, per_page, status)
    
    return CaseListResponse(
        cases=cases,
        total=total,
        page=page,
        per_page=per_page
    )


@router.post("", response_model=CaseResponse)
async def create_case(
    case_data: CaseCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        case = await CaseService.create_case(db, case_data, current_user.id)
        return case
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        case = await CaseService.get_case(db, case_id)
        
        if current_user.role.name == "abogado" and case.assigned_lawyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene acceso a este caso"
            )
        
        return case
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: int,
    case_data: CaseUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        case = await CaseService.update_case(db, case_id, case_data)
        return case
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{case_id}/assign", response_model=CaseResponse)
async def assign_case(
    case_id: int,
    assign_data: CaseAssign,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        case = await CaseService.assign_case(db, case_id, assign_data.lawyer_id)
        await db.commit()
        
        try:
            send_assignment_notification_task(
                lawyer_id=assign_data.lawyer_id,
                case_id=case_id
            )
        except Exception:
            pass
        
        return case
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{case_id}/timeline")
async def get_case_timeline(
    case_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.models.action import Action
    
    case = await CaseService.get_case(db, case_id)
    
    if current_user.role.name == "abogado" and case.assigned_lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene acceso a este caso"
        )
    
    result = await db.execute(
        select(Action)
        .where(Action.case_id == case_id)
        .order_by(Action.action_date.desc())
    )
    actions = result.scalars().all()
    
    return {"actions": actions}


@router.post("/{case_id}/documents", response_model=CaseDocumentResponse)
async def upload_case_document(
    case_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    case = await CaseService.get_case(db, case_id)

    if current_user.role.name == "abogado" and case.assigned_lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene acceso a este caso"
        )

    upload_dir = os.path.join("uploads", "cases", str(case_id))
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename or "")[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    file_url = f"/uploads/cases/{case_id}/{unique_filename}"

    document = CaseDocument(
        case_id=case_id,
        file_name=file.filename,
        file_url=file_url,
        file_type=file.content_type,
        file_size=len(content),
        uploaded_by_id=current_user.id
    )
    db.add(document)
    await db.flush()
    await db.refresh(document)

    return document


@router.get("/{case_id}/documents", response_model=List[CaseDocumentResponse])
async def list_case_documents(
    case_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    case = await CaseService.get_case(db, case_id)

    if current_user.role.name == "abogado" and case.assigned_lawyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene acceso a este caso"
        )

    result = await db.execute(
        select(CaseDocument)
        .where(CaseDocument.case_id == case_id)
        .order_by(CaseDocument.created_at.desc())
    )
    documents = result.scalars().all()
    return documents
