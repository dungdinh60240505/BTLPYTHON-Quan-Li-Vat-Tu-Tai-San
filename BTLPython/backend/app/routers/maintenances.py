from __future__ import annotations

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.maintenance import MaintenancePriority, MaintenanceStatus, MaintenanceType
from app.models.user import User, UserRole
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceResponse,
    MaintenanceStatusUpdate,
    MaintenanceUpdate,
)
from app.services.maintenance_service import (
    create_maintenance,
    delete_maintenance,
    get_maintenance_or_404,
    list_maintenances,
    remove_maintenance_attachment,
    update_maintenance,
    update_maintenance_attachment,
    update_maintenance_status,
)

router = APIRouter(prefix="/maintenances", tags=["Maintenances"])


@router.get("", response_model=list[MaintenanceResponse])
def read_maintenances(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    keyword: str | None = Query(default=None, min_length=1, max_length=255),
    asset_id: int | None = Query(default=None, ge=1),
    assigned_to_user_id: int | None = Query(default=None, ge=1),
    reported_by_user_id: int | None = Query(default=None, ge=1),
    maintenance_type: MaintenanceType | None = Query(default=None),
    priority: MaintenancePriority | None = Query(default=None),
    status_filter: MaintenanceStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)),
):
    return list_maintenances(
        db=db,
        skip=skip,
        limit=limit,
        keyword=keyword,
        asset_id=asset_id,
        assigned_to_user_id=assigned_to_user_id,
        reported_by_user_id=reported_by_user_id,
        maintenance_type=maintenance_type.value if maintenance_type is not None else None,
        priority=priority.value if priority is not None else None,
        status_filter=status_filter.value if status_filter is not None else None,
    )


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def read_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)),
):
    return get_maintenance_or_404(db=db, maintenance_id=maintenance_id)


@router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_new_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)),
):
    return create_maintenance(db=db, payload=payload, current_user=current_user)


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_existing_maintenance(
    maintenance_id: int,
    payload: MaintenanceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    maintenance = get_maintenance_or_404(db=db, maintenance_id=maintenance_id)
    return update_maintenance(db=db, maintenance=maintenance, payload=payload)


@router.patch("/{maintenance_id}/status", response_model=MaintenanceResponse)
def update_existing_maintenance_status(
    maintenance_id: int,
    payload: MaintenanceStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)),
):
    maintenance = get_maintenance_or_404(db=db, maintenance_id=maintenance_id)
    return update_maintenance_status(db=db, maintenance=maintenance, payload=payload)


@router.delete("/{maintenance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    maintenance = get_maintenance_or_404(db=db, maintenance_id=maintenance_id)
    delete_maintenance(db=db, maintenance=maintenance)


@router.post("/{maintenance_id}/attachment", response_model=MaintenanceResponse)
def upload_maintenance_attachment(
    maintenance_id: int,
    attachment: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)),
):
    maintenance = get_maintenance_or_404(db=db, maintenance_id=maintenance_id)
    return update_maintenance_attachment(db=db, maintenance=maintenance, upload_file=attachment)


@router.delete("/{maintenance_id}/attachment", response_model=MaintenanceResponse)
def delete_maintenance_attachment(
    maintenance_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)),
):
    maintenance = get_maintenance_or_404(db=db, maintenance_id=maintenance_id)
    return remove_maintenance_attachment(db=db, maintenance=maintenance)
