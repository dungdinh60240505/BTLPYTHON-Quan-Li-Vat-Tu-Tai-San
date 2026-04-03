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


def save_avatar_file(*, upload_file: UploadFile, user_id: int) -> str:
    content_type = upload_file.content_type or ""
    extension = ALLOWED_IMAGE_TYPES.get(content_type.lower())
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, GIF, and WEBP images are allowed",
        )

    file_bytes = upload_file.file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(file_bytes) > settings.MAX_AVATAR_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar file size must be 2MB or less",
        )

    settings.AVATAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"user_{user_id}_{uuid4().hex}{extension}"
    file_path = settings.AVATAR_UPLOAD_DIR / filename
    file_path.write_bytes(file_bytes)
    return f"/uploads/avatars/{filename}"


def delete_local_avatar(avatar_url: str | None) -> None:
    if not avatar_url or not avatar_url.startswith("/uploads/avatars/"):
        return

    file_name = Path(avatar_url).name
    file_path = settings.AVATAR_UPLOAD_DIR / file_name
    if file_path.exists():
        file_path.unlink()
