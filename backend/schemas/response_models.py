from pydantic import BaseModel
from typing import Optional
from schemas.request_models import OCRReceiptData

class OCRResponse(BaseModel):
    success: bool
    data: Optional[OCRReceiptData]
    confidence_score: float
    error_message: Optional[str] = None
