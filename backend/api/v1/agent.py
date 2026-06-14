from fastapi import APIRouter, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel
import shutil
import os
import uuid
from core.config import settings
from services.impact_agent import ImpactAgent
from services.pii_redactor import PIIRedactor
from supabase import create_client, Client

router = APIRouter()
impact_agent = ImpactAgent()
pii_redactor = PIIRedactor()

PROOFS_DIR = "../proofs"
os.makedirs(PROOFS_DIR, exist_ok=True)

async def process_agent_report(message: str, image_filename: str):
    try:
        # 1. PII Redaction
        redaction_result = pii_redactor.mask_text(message, ngo_id="mvp-ngo-id")
        masked_text = redaction_result["masked_text"]
        
        # 2. Extract Impact Data using Llama-3
        impact_data = await impact_agent.extract_impact_data(masked_text)
        
        # 3. Save to Supabase `impact_logs`
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        projects_res = supabase.table('projects').select('project_id').limit(1).execute()
        if not projects_res.data:
            print("No project found to associate this impact log with.")
            return
            
        project_id = projects_res.data[0]['project_id']
        
        image_url = f"http://127.0.0.1:8000/proofs/{image_filename}" if image_filename else None
        
        log_record = {
            "project_id": project_id,
            "quantity_delivered": impact_data.qty,
            "masked_narrative": f"Item: {impact_data.item}. Narrative: {masked_text}",
            "gps_coordinates": impact_data.location,
            "image_hash": image_url, # Using image_hash field to store the local URL for MVP
            "status": "pending_approval"
        }
        
        supabase.table('impact_logs').insert(log_record).execute()
        print(f"Impact Log Saved: {log_record}")

    except Exception as e:
        print(f"Error processing agent report: {e}")

from typing import Optional

@router.post("/report")
async def agent_report(
    background_tasks: BackgroundTasks,
    message: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    image_filename = None
    if file:
        image_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(PROOFS_DIR, image_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
    background_tasks.add_task(process_agent_report, message, image_filename)
    
    return {"status": "success", "message": "Report received and processing in background"}
