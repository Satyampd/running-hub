from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Literal
from app.core.supabase_client import SUPABASE_URL, supabase
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()

class GenerateUploadUrlRequest(BaseModel):
    type: Literal["club", "event"]
    event_date: str  # YYYY-MM-DD
    event_name: str
    file_ext: str  # e.g. 'jpeg', 'png'
    index: int  # 1, 2, or 3
    file: UploadFile

@router.post("/generate-upload-url/")
async def generate_upload_url(
    type: Literal["club", "event"] = Form(...),
    event_date: str = Form(...),  # YYYY-MM-DD
    event_name: str = Form(...),
    file_ext: str = Form(...),  # e.g. 'jpeg', 'png'
    index: int = Form(...),  # 1, 2, or 3
    file: UploadFile = File(...)
):
    if index not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Index must be 1, 2, or 3.")

    if type not in ["club", "event"]:
        raise HTTPException(status_code=400, detail="Invalid type. Must be 'club' or 'event'.")

    bucket = "runzaarwebsite"

    safe_event_name = event_name.replace(" ", "_").replace("/", "-")
    if type == "club":
        file_path = f"clubs/{safe_event_name}/{safe_event_name}_{index}.{file_ext}"
    else:
        file_path = f"events/{event_date}/{safe_event_name}_{index}.{file_ext}"

    try:
        
        file_bytes = await file.read()
        result = supabase.storage.from_(bucket).upload(file_path, file_bytes, {"content-type": file.content_type, "upsert": "true"} )

        logger.info(f"File uploaded successfully: {result}")

        # Build URLs
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{file_path}"
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{file_path}"

        return {
            "message": "Upload successful",
            "upload_url": upload_url,
            "public_url": public_url,
            "bucket": bucket,
            "path": file_path
        }

    except Exception as e:
        logger.error(f"Failed to upload file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file.")