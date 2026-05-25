from app.core.s3 import get_presigned_upload_url as _upload_url
from app.core.s3 import get_presigned_view_url as _view_url


def get_presigned_upload_url(s3_key: str, content_type: str) -> str:
    return _upload_url(s3_key, content_type)


def get_presigned_view_url(s3_key: str) -> str:
    return _view_url(s3_key)
