import hmac
import hashlib
from fastapi import Request, HTTPException
from core.config import settings

async def verify_whatsapp_signature(request: Request):
    """
    Verifies the HMAC SHA-256 signature from WhatsApp webhooks.
    """
    signature = request.headers.get("x-hub-signature-256")
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")
    
    body = await request.body()
    expected_signature = "sha256=" + hmac.new(
        settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    return True

def verify_jwt(token: str):
    # For MVP, we will rely on Supabase's built-in JWT verification at the database level using RLS, 
    # but we can decode here if needed for user context.
    pass
