import os
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(tags=["mock-s3"])

MOCK_S3_DIR = "mock_s3_storage"

@router.put("/mock-s3/{s3_key:path}")
async def upload_mock_s3(s3_key: str, request: Request):
    file_path = os.path.join(MOCK_S3_DIR, s3_key)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    try:
        content = await request.body()
        with open(file_path, "wb") as f:
            f.write(content)
        return {"status": "success", "message": f"File uploaded to mock S3 at {s3_key}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mock-s3/{s3_key:path}")
def get_mock_s3(s3_key: str):
    file_path = os.path.join(MOCK_S3_DIR, s3_key)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found in mock S3")
    return FileResponse(file_path)
