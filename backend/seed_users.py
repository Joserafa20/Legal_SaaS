import asyncio
from app.core.database import AsyncSessionLocal
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate

async def main():
    async with AsyncSessionLocal() as db:
        users_data = [
            ("admin@legalsaas.com", "Admin123!", "Admin Legal SaaS", "+573001234567", 1),
            ("abogado@legalsaas.com", "Abogado123!", "Abogado Legal SaaS", "+573001111111", 2),
        ]
        for email, pwd, name, phone, role_id in users_data:
            try:
                u = await AuthService.create_user(db, UserCreate(email=email, password=pwd, full_name=name, phone=phone, role_id=role_id))
                print(f"Creado: {u.email} (role_id={u.role_id})")
            except ValueError as e:
                print(f"{email}: {e}")
        await db.commit()

asyncio.run(main())
