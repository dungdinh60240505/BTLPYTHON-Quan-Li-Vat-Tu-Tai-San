from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.core.database import SessionLocal, create_db_and_tables
from app.core.security import get_password_hash
from app.models.asset import Asset, AssetCondition, AssetStatus
from app.models.department import Department
from app.models.supply import Supply
from app.models.user import User, UserRole


def get_or_create_department(db, *, code: str, name: str, description: str) -> Department:
    department = db.scalar(select(Department).where(Department.code == code))
    if department is None:
        department = Department(code=code, name=name, description=description)
        db.add(department)
        db.flush()
    return department


def get_or_create_user(
    db,
    *,
    username: str,
    email: str,
    full_name: str,
    role: UserRole,
    department_id: int | None,
    password: str,
) -> User:
    user = db.scalar(select(User).where(User.username == username))
    if user is None:
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            role=role,
            department_id=department_id,
            hashed_password=get_password_hash(password),
        )
        db.add(user)
        db.flush()
    return user


def get_or_create_asset(db, **kwargs) -> Asset:
    asset = db.scalar(select(Asset).where(Asset.asset_code == kwargs["asset_code"]))
    if asset is None:
        asset = Asset(**kwargs)
        db.add(asset)
        db.flush()
    return asset


def get_or_create_supply(db, **kwargs) -> Supply:
    supply = db.scalar(select(Supply).where(Supply.supply_code == kwargs["supply_code"]))
    if supply is None:
        supply = Supply(**kwargs)
        db.add(supply)
        db.flush()
    return supply


def seed() -> None:
    create_db_and_tables()
    db = SessionLocal()
    try:
        admin_department = get_or_create_department(
            db,
            code="HCQT",
            name="Phong Hanh chinh Quan tri",
            description="Quan ly tai san va vat tu toan hoc vien",
        )
        it_department = get_or_create_department(
            db,
            code="CNTT",
            name="Trung tam Cong nghe thong tin",
            description="Quan tri ha tang va thiet bi cong nghe",
        )
        lab_department = get_or_create_department(
            db,
            code="LAB",
            name="Phong Thi nghiem",
            description="Quan ly vat tu va thiet bi phong lab",
        )

        admin_user = get_or_create_user(
            db,
            username="admin",
            email="admin@ptit.edu.vn",
            full_name="System Administrator",
            role=UserRole.ADMIN,
            department_id=admin_department.id,
            password="Admin@123",
        )
        manager_user = get_or_create_user(
            db,
            username="manager",
            email="manager@ptit.edu.vn",
            full_name="Asset Manager",
            role=UserRole.MANAGER,
            department_id=it_department.id,
            password="Manager@123",
        )

        get_or_create_asset(
            db,
            asset_code="TS001",
            name="Dell Latitude 5440",
            category="Laptop",
            serial_number="DL5440PTIT001",
            specification="Core i7, 16GB RAM, 512GB SSD",
            purchase_date=date(2025, 1, 15),
            purchase_cost=Decimal("23500000"),
            status=AssetStatus.AVAILABLE,
            condition=AssetCondition.NEW,
            location="Kho CNTT",
            note="San sang cap phat",
            assigned_department_id=it_department.id,
            assigned_user_id=manager_user.id,
        )
        get_or_create_asset(
            db,
            asset_code="TS002",
            name="May chieu Epson EB-X06",
            category="Projector",
            serial_number="EPSONX06002",
            specification="XGA, 3600 lumens",
            purchase_date=date(2024, 9, 1),
            purchase_cost=Decimal("12500000"),
            status=AssetStatus.IN_USE,
            condition=AssetCondition.GOOD,
            location="Giang duong A2",
            note="Dang su dung",
            assigned_department_id=admin_department.id,
            assigned_user_id=admin_user.id,
        )

        get_or_create_supply(
            db,
            supply_code="VT001",
            name="Giay A4 Double A",
            category="Van phong pham",
            unit="ream",
            quantity_in_stock=Decimal("25"),
            minimum_stock_level=Decimal("10"),
            unit_price=Decimal("78000"),
            location="Kho van phong",
            description="Giay in A4 80gsm",
            note=None,
            managed_department_id=admin_department.id,
        )
        get_or_create_supply(
            db,
            supply_code="VT002",
            name="Muc in HP 05A",
            category="Muc in",
            unit="cartridge",
            quantity_in_stock=Decimal("2"),
            minimum_stock_level=Decimal("5"),
            unit_price=Decimal("1850000"),
            location="Kho vat tu CNTT",
            description="Muc in dung cho HP LaserJet P2035",
            note="Can nhap them som",
            managed_department_id=it_department.id,
        )

        db.commit()
        print("Seed data created successfully.")
        print("Admin account: admin / Admin@123")
        print("Manager account: manager / Manager@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
