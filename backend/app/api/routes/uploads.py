import uuid
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user, require_instructor
from app.schemas.course_schema import S3UploadRequest, S3UploadResponse
from app.services import s3_service

router = APIRouter(tags=["uploads"])


@router.post("/presigned-url", response_model=S3UploadResponse)
def get_presigned_upload_url(
    data: S3UploadRequest,
    current_user=Depends(require_instructor),
):
    unique_id = str(uuid.uuid4())
    s3_key = f"{data.s3_prefix}/{unique_id}/{data.filename}"
    upload_url = s3_service.get_presigned_upload_url(s3_key, data.content_type)
    return S3UploadResponse(upload_url=upload_url, s3_key=s3_key)


@router.get("/view-url/{s3_key:path}")
def get_view_url(
    s3_key: str,
    current_user=Depends(get_current_user),
):
    view_url = s3_service.get_presigned_view_url(s3_key)
    return {"view_url": view_url}
