from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.allocation import Allocation, AllocationStatus
from app.models.asset import Asset
from app.models.department import Department
from app.models.maintenance import Maintenance, MaintenanceStatus
from app.models.supply import Supply
from app.models.user import User
from app.schemas.report import (
    AllocationStatusSummaryItem,
    AssetStatusSummaryItem,
    DashboardSummary,
    LowStockSupplyItem,
    MaintenanceStatusSummaryItem,
    RecentActivityItem,
)



def get_dashboard_summary(db: Session) -> DashboardSummary:
    total_departments = db.scalar(select(func.count(Department.id))) or 0
    total_users = db.scalar(select(func.count(User.id))) or 0
    total_assets = db.scalar(select(func.count(Asset.id))) or 0
    total_supplies = db.scalar(select(func.count(Supply.id))) or 0
    active_allocations = db.scalar(select(func.count(Allocation.id))) or 0
    active_maintenances = db.scalar(select(func.count(Maintenance.id))) or 0
    low_stock_supplies = db.scalar(
        select(func.count(Supply.id)).where(
            Supply.quantity_in_stock <= Supply.minimum_stock_level,
        )
    ) or 0

    return DashboardSummary(
        generated_at=datetime.now(timezone.utc),
        total_departments=int(total_departments),
        total_users=int(total_users),
        total_assets=int(total_assets),
        total_supplies=int(total_supplies),
        active_allocations=int(active_allocations),
        active_maintenances=int(active_maintenances),
        low_stock_supplies=int(low_stock_supplies),
    )


def get_asset_status_summary(db: Session) -> list[AssetStatusSummaryItem]:
    rows = db.execute(
        select(Asset.status, func.count(Asset.id))
        .group_by(Asset.status)
        .order_by(Asset.status)
    ).all()
    return [AssetStatusSummaryItem(status=status, count=count) for status, count in rows]


def get_low_stock_supplies(db: Session) -> list[LowStockSupplyItem]:
    rows = db.execute(
        select(Supply, Department.name)
        .outerjoin(Department, Supply.managed_department_id == Department.id)
        .where(
            Supply.quantity_in_stock <= Supply.minimum_stock_level,
        )
        .order_by(Supply.quantity_in_stock.asc(), Supply.id.desc())
    ).all()

    results: list[LowStockSupplyItem] = []
    for supply, department_name in rows:
        results.append(
            LowStockSupplyItem(
                id=supply.id,
                supply_code=supply.supply_code,
                name=supply.name,
                category=supply.category,
                unit=supply.unit,
                quantity_in_stock=supply.quantity_in_stock,
                minimum_stock_level=supply.minimum_stock_level,
                managed_department_id=supply.managed_department_id,
                managed_department_name=department_name,
            )
        )
    return results


def get_allocation_status_summary(db: Session) -> list[AllocationStatusSummaryItem]:
    rows = db.execute(
        select(Allocation.status, func.count(Allocation.id))
        .where(Allocation.is_active.is_(True))
        .group_by(Allocation.status)
        .order_by(Allocation.status)
    ).all()
    return [AllocationStatusSummaryItem(status=status, count=count) for status, count in rows]


def get_maintenance_status_summary(db: Session) -> list[MaintenanceStatusSummaryItem]:
    rows = db.execute(
        select(Maintenance.status, func.count(Maintenance.id))
        .group_by(Maintenance.status)
        .order_by(Maintenance.status)
    ).all()
    return [MaintenanceStatusSummaryItem(status=status, count=count) for status, count in rows]


def get_recent_activity(db: Session, *, limit: int = 10) -> list[RecentActivityItem]:
    asset_rows = db.execute(
        select(Asset.asset_code, Asset.name, Asset.status, Asset.updated_at)
        .order_by(Asset.updated_at.desc())
        .limit(limit)
    ).all()
    supply_rows = db.execute(
        select(Supply.supply_code, Supply.name, Supply.quantity_in_stock, Supply.updated_at)
        .order_by(Supply.updated_at.desc())
        .limit(limit)
    ).all()
    maintenance_rows = db.execute(
        select(Maintenance.maintenance_code, Maintenance.title, Maintenance.status, Maintenance.updated_at)
        .order_by(Maintenance.updated_at.desc())
        .limit(limit)
    ).all()
    allocation_rows = db.execute(
        select(Allocation.allocation_code, Allocation.allocation_type, Allocation.status, Allocation.updated_at)
        .where(Allocation.is_active.is_(True))
        .order_by(Allocation.updated_at.desc())
        .limit(limit)
    ).all()

    items: list[RecentActivityItem] = []
    for code, title, status, activity_date in asset_rows:
        items.append(
            RecentActivityItem(
                source="asset",
                code=code,
                title=title,
                status=str(status.value if hasattr(status, "value") else status),
                activity_date=activity_date,
            )
        )
    for code, title, quantity, activity_date in supply_rows:
        items.append(
            RecentActivityItem(
                source="supply",
                code=code,
                title=title,
                status=f"stock={quantity}",
                activity_date=activity_date,
            )
        )
    for code, title, status, activity_date in maintenance_rows:
        items.append(
            RecentActivityItem(
                source="maintenance",
                code=code,
                title=title,
                status=str(status.value if hasattr(status, "value") else status),
                activity_date=activity_date,
            )
        )
    for code, allocation_type, status, activity_date in allocation_rows:
        items.append(
            RecentActivityItem(
                source="allocation",
                code=code,
                title=str(allocation_type.value if hasattr(allocation_type, "value") else allocation_type),
                status=str(status.value if hasattr(status, "value") else status),
                activity_date=activity_date,
            )
        )

    items.sort(
        key=lambda item: item.activity_date.isoformat() if item.activity_date else "",
        reverse=True,
    )
    return items[:limit]
