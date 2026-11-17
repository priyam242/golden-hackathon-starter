"""
Golden Hackathon Starter — Universal Response Envelope & RFC 7807 Error Handling
Every endpoint returns a predictable { success, message, data, meta } structure.
"""

from typing import Any, Optional, Dict, List
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        code: str = "BAD_REQUEST",
        message: str = "An error occurred",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or []
        super().__init__(message)


def success_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    meta: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_200_OK,
) -> JSONResponse:
    content = {
        "success": True,
        "message": message,
        "data": data,
    }
    if meta is not None:
        content["meta"] = meta
    return JSONResponse(status_code=status_code, content=content)


def error_response(
    status_code: int = status.HTTP_400_BAD_REQUEST,
    code: str = "ERROR",
    message: str = "Request failed",
    details: Optional[List[Dict[str, Any]]] = None,
) -> JSONResponse:
    content = {
        "success": False,
        "message": message,
        "error": {
            "code": code,
            "details": details or [],
        },
    }
    return JSONResponse(status_code=status_code, content=content)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return error_response(
            status_code=exc.status_code,
            code=exc.code,
            message=exc.message,
            details=exc.details,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        details = []
        for err in exc.errors():
            loc = " -> ".join(str(l) for l in err.get("loc", []))
            details.append({"field": loc, "message": err.get("msg", "Invalid value")})
        return error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message="Input validation failed",
            details=details,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return error_response(
            status_code=exc.status_code,
            code="HTTP_ERROR",
            message=str(exc.detail),
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred. Please try again.",
            details=[{"debug": str(exc)}] if app.debug else [],
        )
