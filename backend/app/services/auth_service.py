from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.user import User, Role
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.schemas.user import UserCreate, LoginRequest, TokenResponse, UserResponse


class AuthService:
    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        result = await db.execute(
            select(User).options(selectinload(User.role)).where(User.email == user_data.email)
        )
        if result.scalar_one_or_none():
            raise ValueError("El email ya está registrado")
        
        role = await db.get(Role, user_data.role_id)
        if not role:
            raise ValueError("Rol no válido")
        
        user = User(
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            phone=user_data.phone,
            role_id=user_data.role_id
        )
        db.add(user)
        await db.flush()
        result = await db.execute(
            select(User).options(selectinload(User.role)).where(User.id == user.id)
        )
        return result.scalar_one()
    
    @staticmethod
    async def login(db: AsyncSession, login_data: LoginRequest) -> TokenResponse:
        result = await db.execute(
            select(User).options(selectinload(User.role)).where(User.email == login_data.email)
        )
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise ValueError("Credenciales inválidas")
        
        if not user.is_active:
            raise ValueError("Usuario desactivado")
        
        user.last_login = datetime.now(timezone.utc)
        await db.flush()
        
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user)
        )
    
    @staticmethod
    async def refresh_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Token de refresco inválido")
        
        user_id = payload.get("sub")
        result = await db.execute(select(User).options(selectinload(User.role)).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise ValueError("Usuario no válido")
        
        token_data = {"sub": str(user.id), "email": user.email}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user=UserResponse.model_validate(user)
        )
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
        result = await db.execute(select(User).options(selectinload(User.role)).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("Usuario no encontrado")
        return user
    
    @staticmethod
    async def init_roles(db: AsyncSession):
        roles = [
            {"name": "admin", "description": "Administrador / Socio"},
            {"name": "abogado", "description": "Abogado"},
        ]
        
        for role_data in roles:
            existing = await db.execute(
                select(Role).where(Role.name == role_data["name"])
            )
            if not existing.scalar_one_or_none():
                role = Role(**role_data)
                db.add(role)
        
        await db.commit()
