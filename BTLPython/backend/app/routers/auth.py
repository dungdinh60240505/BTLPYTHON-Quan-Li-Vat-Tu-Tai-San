from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.schemas.auth import (
    AuthenticatedUser,
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    Token,
)
from app.services.auth_service import (
    authenticate_user,
    change_password,
    create_user_access_token,
    register_user,
)
from app.services.user_service import update_user_avatar
from app.utils.file_storage import delete_local_avatar, save_avatar_file

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=AuthenticatedUser,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> User:
    return register_user(db=db, payload=payload)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(
        db=db,
        username=form_data.username,
        password=form_data.password,
    )
    access_token = create_user_access_token(user)
    return Token(access_token=access_token)


@router.post("/login-json", response_model=Token)
def login_json(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(
        db=db,
        username=payload.username,
        password=payload.password,
    )
    access_token = create_user_access_token(user)
    return Token(access_token=access_token)


@router.get("/me", response_model=AuthenticatedUser)
def read_current_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    return current_user


@router.post("/me/avatar", response_model=AuthenticatedUser)
def upload_my_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> User:
    avatar_url = save_avatar_file(upload_file=avatar, user_id=current_user.id)
    delete_local_avatar(current_user.avatar_url)
    return update_user_avatar(db=db, user=current_user, avatar_url=avatar_url)


@router.post("/change-password", response_model=AuthenticatedUser)
def update_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> User:
    return change_password(db=db, user=current_user, payload=payload)
