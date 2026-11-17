"""
Golden Hackathon Starter — File Storage & Streaming Core
Handles secure receipt uploads, PDF streaming, CSV ingestion, and media previews.
"""

import os
import uuid
import mimetypes
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel

from core.config import UPLOAD_DIR
from core.envelope import success_response, AppException

router = APIRouter(prefix="/api/files", tags=["Files"])

# In-memory registry of uploaded files for quick lookup without heavy DB overhead
UPLOADED_FILES: Dict[str, Dict[str, Any]] = {}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Secure file upload supporting Images (JPEG, PNG, WEBP), PDFs, and CSVs.
    """
    if not file.filename:
        raise AppException(status_code=400, code="INVALID_FILENAME", message="Filename is required")

    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".csv", ".txt", ".json"]
    if file_ext not in allowed_exts:
        raise AppException(
            status_code=400,
            code="UNSUPPORTED_FILE_TYPE",
            message=f"File extension {file_ext} is not supported. Allowed: {allowed_exts}",
        )

    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)

    file_bytes = await file.read()
    max_size = 15 * 1024 * 1024  # 15 MB
    if len(file_bytes) > max_size:
        raise AppException(status_code=413, code="FILE_TOO_LARGE", message="File exceeds maximum size of 15MB")

    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    meta = {
        "id": file_id,
        "filename": safe_filename,
        "originalName": file.filename,
        "mimeType": mime_type,
        "size": len(file_bytes),
        "url": f"/api/files/{file_id}/view",
        "downloadUrl": f"/api/files/{file_id}/download",
    }
    UPLOADED_FILES[file_id] = meta

    return success_response(data=meta, message="File uploaded successfully", status_code=status.HTTP_201_CREATED)


@router.get("/{file_id}/view")
async def view_file(file_id: str):
    """
    View or stream file in browser with appropriate content-type.
    """
    meta = UPLOADED_FILES.get(file_id)
    if not meta:
        # Check disk directly
        for ext in [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".csv", ".txt", ".json"]:
            path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
            if os.path.exists(path):
                mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
                return FileResponse(path, media_type=mime)
        raise AppException(status_code=404, code="FILE_NOT_FOUND", message="Requested file does not exist")

    path = os.path.join(UPLOAD_DIR, meta["filename"])
    if not os.path.exists(path):
        raise AppException(status_code=404, code="FILE_NOT_FOUND", message="File missing from storage")

    return FileResponse(path, media_type=meta["mimeType"])


@router.get("/{file_id}/download")
async def download_file(file_id: str):
    """
    Download file with original filename header.
    """
    meta = UPLOADED_FILES.get(file_id)
    if not meta:
        raise AppException(status_code=404, code="FILE_NOT_FOUND", message="Requested file does not exist")

    path = os.path.join(UPLOAD_DIR, meta["filename"])
    return FileResponse(path, filename=meta["originalName"], media_type=meta["mimeType"])


@router.get("")
async def list_files():
    """
    List recently uploaded files.
    """
    return success_response(data=list(UPLOADED_FILES.values()), message="Files retrieved")
