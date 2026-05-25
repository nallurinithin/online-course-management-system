import boto3
from botocore.exceptions import ClientError
from app.core.config import settings


def get_presigned_upload_url(s3_key: str, content_type: str) -> str:
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        return f"http://localhost:8000/mock-s3/{s3_key}"

    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": s3_key,
                "ContentType": content_type,
            },
            ExpiresIn=300,
        )
        return url
    except ClientError as e:
        raise RuntimeError(f"Failed to generate presigned upload URL: {e}")


def get_presigned_view_url(s3_key: str) -> str:
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        return f"http://localhost:8000/mock-s3/{s3_key}"

    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": s3_key,
            },
            ExpiresIn=3600,
        )
        return url
    except ClientError as e:
        raise RuntimeError(f"Failed to generate presigned view URL: {e}")
