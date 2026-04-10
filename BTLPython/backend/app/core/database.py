from typing import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def create_db_and_tables() -> None:
    """Create tables for all imported ORM models."""
    Base.metadata.create_all(bind=engine)
    ensure_runtime_schema()


def ensure_runtime_schema() -> None:
    """Apply lightweight schema upgrades for local development databases."""
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "avatar_url" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))

    if inspector.has_table("allocations"):
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    UPDATE allocations
                    SET status = 'returned'
                    WHERE status = 'completed'
                    """
                )
            )

    if not inspector.has_table("maintenances"):
        return

    maintenance_columns = {column["name"] for column in inspector.get_columns("maintenances")}
    maintenance_attachment_columns = {
        "attachment_original_name": "ALTER TABLE maintenances ADD COLUMN attachment_original_name VARCHAR(255)",
        "attachment_stored_name": "ALTER TABLE maintenances ADD COLUMN attachment_stored_name VARCHAR(255)",
        "attachment_url": "ALTER TABLE maintenances ADD COLUMN attachment_url VARCHAR(500)",
        "attachment_mime_type": "ALTER TABLE maintenances ADD COLUMN attachment_mime_type VARCHAR(100)",
        "attachment_size": "ALTER TABLE maintenances ADD COLUMN attachment_size INTEGER",
    }
    missing_maintenance_columns = {
        column_name: statement
        for column_name, statement in maintenance_attachment_columns.items()
        if column_name not in maintenance_columns
    }
    if missing_maintenance_columns:
        with engine.begin() as connection:
            for statement in missing_maintenance_columns.values():
                connection.execute(text(statement))
