from fastapi import APIRouter, Request, Depends, HTTPException, Query, BackgroundTasks
from core.security import verify_whatsapp_signature
from core.config import settings
from services.impact_agent import ImpactAgent
from services.pii_redactor import PIIRedactor
from supabase import create_client, Client
import json

router = APIRouter()
impact_agent = ImpactAgent()
pii_redactor = PIIRedactor()

from fastapi.responses import PlainTextResponse

@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN:
        return PlainTextResponse(str(hub_challenge))
    raise HTTPException(status_code=403, detail="Verification failed")

async def process_whatsapp_message(payload: dict):
    """
    Background task to process the WhatsApp message, call AI models, and save to DB.
    """
    try:
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        
        # We only care about user messages, not status updates
        if "messages" not in value:
            return
            
        message = value["messages"][0]
        msg_type = message.get("type")
        
        extracted_text = ""
        
        if msg_type == "text":
            extracted_text = message["text"]["body"]
        elif msg_type == "audio":
            # In a full implementation, you would download the audio file from Meta 
            # using the message['audio']['id'] and WHATSAPP_API_TOKEN, then pass to Whisper.
            # For the MVP, we simulate passing the audio to the transcription service
            extracted_text = "Sunita received 50 bags at the Pune school." # Simulated transcription
        else:
            # We skip unsupported types for now
            return

        # 1. PII Redaction
        redaction_result = pii_redactor.mask_text(extracted_text, ngo_id="mvp-ngo-id")
        masked_text = redaction_result["masked_text"]
        
        # 2. Extract Impact Data using Llama-3
        impact_data = await impact_agent.extract_impact_data(masked_text)
        
        # 3. Save to Supabase `impact_logs`
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        # Note: We need a project_id. In a real app, we'd lookup by phone number.
        # For MVP, we use the first project we find, or a hardcoded one.
        projects_res = supabase.table('projects').select('project_id').limit(1).execute()
        if not projects_res.data:
            print("No project found to associate this impact log with.")
            return
            
        project_id = projects_res.data[0]['project_id']
        
        log_record = {
            "project_id": project_id,
            "quantity_delivered": impact_data.qty,
            "masked_narrative": f"Item: {impact_data.item}. Narrative: {masked_text}",
            "gps_coordinates": impact_data.location,
            "status": "pending_approval"
        }
        
        supabase.table('impact_logs').insert(log_record).execute()
        print(f"Impact Log Saved: {log_record}")

    except Exception as e:
        print(f"Error processing WhatsApp message: {e}")


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    print("================ WEBHOOK RECEIVED ================")
    print(json.dumps(payload, indent=2))
    print("==================================================")
    
    # Process message in background to avoid WhatsApp timeout (requires 200 OK fast)
    background_tasks.add_task(process_whatsapp_message, payload)
    
    return {"status": "received"}
