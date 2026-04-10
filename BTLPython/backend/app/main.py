from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import create_db_and_tables

import app.models.allocation
import app.models.asset
import app.models.department
import app.models.maintenance
import app.models.supply
import app.models.user

from app.routers.allocations import router as allocation_router
from app.routers.assets import router as asset_router
from app.routers.auth import router as auth_router
from app.routers.departments import router as department_router
from app.routers.maintenances import router as maintenance_router
from app.routers.reports import router as report_router
from app.routers.supplies import router as supply_router
from app.routers.users import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    settings.AVATAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.MAINTENANCE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    create_db_and_tables()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def api_health_check() -> dict[str, str]:
    return {"status": "ok", "version": settings.VERSION}


app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(department_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(asset_router, prefix=settings.API_V1_STR)
app.include_router(supply_router, prefix=settings.API_V1_STR)
app.include_router(allocation_router, prefix=settings.API_V1_STR)
app.include_router(maintenance_router, prefix=settings.API_V1_STR)
app.include_router(report_router, prefix=settings.API_V1_STR)
