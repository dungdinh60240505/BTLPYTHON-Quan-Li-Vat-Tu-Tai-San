from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}

ALLOWED_MAINTENANCE_FILE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
}


def _save_uploaded_file(
    *,
    upload_file: UploadFile,
    allowed_types: dict[str, str],
    max_size_bytes: int,
    target_dir: Path,
    file_prefix: str,
    invalid_type_message: str,
    too_large_message: str,
) -> dict[str, str | int]:
    content_type = (upload_file.content_type or "").lower()
    extension = allowed_types.get(content_type)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=invalid_type_message,
        )

    file_bytes = upload_file.file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=too_large_message,
        )

    target_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{file_prefix}_{uuid4().hex}{extension}"
    file_path = target_dir / stored_name
    file_path.write_bytes(file_bytes)
    return {
        "original_name": upload_file.filename or stored_name,
        "stored_name": stored_name,
        "content_type": content_type,
        "size": len(file_bytes),
    }


def save_avatar_file(*, upload_file: UploadFile, user_id: int) -> str:
    file_info = _save_uploaded_file(
        upload_file=upload_file,
        allowed_types=ALLOWED_IMAGE_TYPES,
        max_size_bytes=settings.MAX_AVATAR_SIZE_BYTES,
        target_dir=settings.AVATAR_UPLOAD_DIR,
        file_prefix=f"user_{user_id}",
        invalid_type_message="Only JPG, PNG, GIF, and WEBP images are allowed",
        too_large_message="Avatar file size must be 2MB or less",
    )
    return f"/uploads/avatars/{file_info['stored_name']}"


def save_maintenance_attachment(*, upload_file: UploadFile, maintenance_id: int) -> dict[str, str | int]:
    file_info = _save_uploaded_file(
        upload_file=upload_file,
        allowed_types=ALLOWED_MAINTENANCE_FILE_TYPES,
        max_size_bytes=settings.MAX_MAINTENANCE_FILE_SIZE_BYTES,
        target_dir=settings.MAINTENANCE_UPLOAD_DIR,
        file_prefix=f"maintenance_{maintenance_id}",
        invalid_type_message="Only JPG, PNG, WEBP, PDF, DOC, DOCX, XLS, and XLSX files are allowed",
        too_large_message="Maintenance attachment size must be 10MB or less",
    )
    return {
        "original_name": str(file_info["original_name"]),
        "stored_name": str(file_info["stored_name"]),
        "mime_type": str(file_info["content_type"]),
        "size": int(file_info["size"]),
        "url": f"/uploads/maintenances/{file_info['stored_name']}",
    }


def _delete_local_file(*, file_url: str | None, expected_prefix: str, target_dir: Path) -> None:
    if not file_url or not file_url.startswith(expected_prefix):
        return

    file_name = Path(file_url).name
    file_path = target_dir / file_name
    if file_path.exists():
        file_path.unlink()


def delete_local_avatar(avatar_url: str | None) -> None:
    _delete_local_file(
        file_url=avatar_url,
        expected_prefix="/uploads/avatars/",
        target_dir=settings.AVATAR_UPLOAD_DIR,
    )


def delete_local_maintenance_attachment(file_url: str | None) -> None:
    _delete_local_file(
        file_url=file_url,
        expected_prefix="/uploads/maintenances/",
        target_dir=settings.MAINTENANCE_UPLOAD_DIR,
    )
