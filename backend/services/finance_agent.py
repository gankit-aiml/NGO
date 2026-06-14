import json
import google.generativeai as genai
from core.config import settings
from schemas.response_models import OCRResponse, OCRReceiptData

class FinanceAgent:
    """
    Handles Gemini 1.5 Flash Vision OCR for handwritten receipts.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def scan_receipt(self, image_filepath: str, file_bytes: bytes, mime_type: str = "image/jpeg") -> OCRResponse:
        """
        Prompts Gemini 2.5 Flash to extract GSTIN, base price, tax, and total.
        """
        prompt = '''
        Analyze this receipt image and extract the following details in strict JSON format:
        {
            "vendor_name": "String, name of the shop/vendor",
            "gstin": "String, GSTIN number if present, else empty string",
            "base_price": Float, the base price before taxes,
            "tax_amount": Float, the tax amount,
            "total_amount": Float, the final total amount
        }
        Return ONLY valid JSON.
        '''
        
        try:
            image_parts = [
                {
                    "mime_type": mime_type,
                    "data": file_bytes
                }
            ]
            response = self.model.generate_content([prompt, image_parts[0]])
            text_response = response.text
            
            # Clean up potential markdown formatting from Gemini response
            if "```json" in text_response:
                text_response = text_response.split("```json")[1].split("```")[0].strip()
            elif "```" in text_response:
                text_response = text_response.split("```")[1].strip()
                
            print(f"RAW GEMINI RESPONSE:\\n{text_response}\\n\\n")
            data = json.loads(text_response)
            
            ocr_data = OCRReceiptData(
                vendor_name=data.get("vendor_name", "Unknown Vendor"),
                gstin=data.get("gstin", ""),
                base_price=float(data.get("base_price", 0.0)),
                tax_amount=float(data.get("tax_amount", 0.0)),
                total_amount=float(data.get("total_amount", 0.0))
            )
            return OCRResponse(
                success=True,
                data=ocr_data,
                confidence_score=0.95
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"FinanceAgent OCR Error: {e}")
            print(f"FinanceAgent OCR Error: {e}")
            return OCRResponse(
                success=False,
                data=OCRReceiptData(vendor_name="Error", gstin="", base_price=0.0, tax_amount=0.0, total_amount=0.0),
                confidence_score=0.0
            )
