from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import os
import uuid
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.action import Action, ActionDocument
from app.models.case import Case
from app.models.user import User
from app.schemas.action import ActionCreate, ActionUpdate, ActionResponse, ActionListResponse

router = APIRouter(prefix="/actions", tags=["Actuaciones"])


async def _check_case_access(case_id: int, user: User, db: AsyncSession):
    if user.role.name == "abogado":
        case = await db.get(Case, case_id)
        if not case or case.assigned_lawyer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene acceso a este caso"
            )


@router.get("/case/{case_id}", response_model=ActionListResponse)
async def get_case_actions(
    case_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    await _check_case_access(case_id, current_user, db)
    result = await db.execute(
        select(Action)
        .options(selectinload(Action.documents))
        .where(Action.case_id == case_id)
        .order_by(Action.action_date.desc())
    )
    actions = result.scalars().all()
    
    return ActionListResponse(actions=actions, total=len(actions))


@router.post("", response_model=ActionResponse)
async def create_action(
    action_data: ActionCreate,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    await _check_case_access(action_data.case_id, current_user, db)
    action = Action(
        case_id=action_data.case_id,
        action_type=action_data.action_type,
        title=action_data.title,
        description=action_data.description,
        action_date=action_data.action_date,
        created_by_id=current_user.id
    )
    db.add(action)
    await db.flush()
    await db.refresh(action)
    result = await db.execute(
        select(Action).options(selectinload(Action.documents)).where(Action.id == action.id)
    )
    action = result.scalar_one()
    return action


@router.get("/{action_id}", response_model=ActionResponse)
async def get_action(
    action_id: int,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Action).options(selectinload(Action.documents)).where(Action.id == action_id))
    action = result.scalar_one_or_none()
    
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actuación no encontrada"
        )
    
    await _check_case_access(action.case_id, current_user, db)
    return action


@router.put("/{action_id}", response_model=ActionResponse)
async def update_action(
    action_id: int,
    action_data: ActionUpdate,
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Action).options(selectinload(Action.documents)).where(Action.id == action_id))
    action = result.scalar_one_or_none()
    
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actuación no encontrada"
        )
    
    await _check_case_access(action.case_id, current_user, db)
    update_data = action_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(action, field, value)
    
    await db.flush()
    await db.refresh(action)
    
    return action


@router.post("/{action_id}/documents", response_model=ActionResponse)
async def upload_document(
    action_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["admin", "abogado"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Action).options(selectinload(Action.documents)).where(Action.id == action_id))
    action = result.scalar_one_or_none()
    
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actuación no encontrada"
        )
    
    await _check_case_access(action.case_id, current_user, db)
    
    upload_dir = os.path.join("uploads", str(action_id))
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename or "")[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    file_url = f"/uploads/{action_id}/{unique_filename}"
    
    document = ActionDocument(
        action_id=action_id,
        file_name=file.filename,
        file_url=file_url,
        file_type=file.content_type,
        file_size=len(content),
        uploaded_by_id=current_user.id
    )
    db.add(document)
    await db.flush()
    await db.refresh(action)
    
    return action
