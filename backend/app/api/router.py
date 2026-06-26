from fastapi import APIRouter
from app.api.v1 import auth, cases, actions, deadlines, ai, users, holidays

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(cases.router)
api_router.include_router(actions.router)
api_router.include_router(deadlines.router)
api_router.include_router(ai.router)
api_router.include_router(users.router)
api_router.include_router(holidays.router)
