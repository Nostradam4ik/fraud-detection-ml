"""
Authentication Routes - Register, Login, Profile Management

Author: Zhmuryk Andrii
Copyright (c) 2024 - All Rights Reserved
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.config import settings
from ...db.database import get_db
from ...models.schemas import Token, UserCreate, UserLogin, UserResponse
from ...services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with username, email, and password."
)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.

    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (minimum 8 characters)
    - **full_name**: Optional full name
    """
    return create_user(db, user_data)


@router.post(
    "/login",
    response_model=Token,
    summary="Login to get access token",
    description="Authenticate with username/email and password to receive a JWT token."
)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with username or email and password.

    Returns a JWT access token that can be used to access protected endpoints.
    Include the token in the Authorization header: `Bearer <token>`
    """
    user = authenticate_user(db, credentials.username, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Get the profile of the currently authenticated user."
)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current user profile.

    Requires authentication via JWT token in Authorization header.
    """
    return current_user


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="Get a new access token using the current valid token."
)
async def refresh_token(current_user: UserResponse = Depends(get_current_user)):
    """
    Refresh the access token.

    Use this endpoint to get a new token before the current one expires.
    Requires a valid JWT token.
    """
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": current_user.username, "user_id": current_user.id},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60
    )
