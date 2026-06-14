from pydantic import BaseModel
from typing import Optional

class ExtractedImpactData(BaseModel):
    item: str
    qty: int
    location: str

class OCRReceiptData(BaseModel):
    vendor_name: str
    gstin: str
    base_price: float
    tax_amount: float
    total_amount: float
