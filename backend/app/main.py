from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    from app.services.auth_service import AuthService
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        await AuthService.init_roles(db)
        await _seed_holidays(db)
    
    yield
    
    await engine.dispose()


async def _seed_holidays(db):
    from datetime import date
    from sqlalchemy import select
    from app.models.holiday import ColombianHoliday, COLOMBIAN_HOLIDAYS_DATA
    
    for holiday_data in COLOMBIAN_HOLIDAYS_DATA:
        holiday_date = date.fromisoformat(holiday_data["date"])
        existing = await db.execute(
            select(ColombianHoliday).where(ColombianHoliday.date == holiday_date)
        )
        if not existing.scalar_one_or_none():
            holiday = ColombianHoliday(
                date=holiday_date,
                name=holiday_data["name"],
                type=holiday_data["type"]
            )
            db.add(holiday)
    await db.commit()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Plataforma SaaS de gestión jurídica con IA para Colombia",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

import os
upload_dir = "uploads"
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.get("/")
async def root():
    return {
        "message": "Legal SaaS Colombia API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
