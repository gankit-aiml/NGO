from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.pm_agents import CharterAgent, ProcurementAgent, DispatchAgent
from core.config import settings
from supabase import create_client, Client
import uuid
import datetime
import json

router = APIRouter()
charter_agent = CharterAgent()
procurement_agent = ProcurementAgent()
dispatch_agent = DispatchAgent()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class CharterRequest(BaseModel):
    core_elements: str
    project_id: str

class CharterSubmit(BaseModel):
    project_id: str
    manager_id: str
    content: Dict[str, Any]

class ProcurementRequest(BaseModel):
    project_id: str
    requirements: str

class DispatchRequest(BaseModel):
    project_id: str
    tasks: List[Dict[str, Any]]

@router.post("/charter/generate")
async def generate_charter(req: CharterRequest):
    try:
        charter = await charter_agent.generate_charter(req.core_elements)
        return {"status": "success", "charter": charter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/charter/submit")
async def submit_charter(req: CharterSubmit):
    record = {
        "charter_id": str(uuid.uuid4()),
        "project_id": req.project_id,
        "manager_id": req.manager_id,
        "content": req.content,
        "status": "pending_approval",
        "created_at": datetime.datetime.now().isoformat()
    }
    supabase.table("project_charters").insert(record).execute()
    return {"status": "success", "data": record}

@router.get("/charters")
async def get_charters():
    res = supabase.table("project_charters").select("*").execute()
    return {"status": "success", "data": res.data}

@router.post("/charter/approve")
async def approve_charter(charter_id: str):
    supabase.table("project_charters").update({"status": "approved"}).eq("charter_id", charter_id).execute()
    return {"status": "success"}

@router.post("/procurement/start")
async def start_procurement(req: ProcurementRequest):
    try:
        quotes = await procurement_agent.fetch_quotations(req.requirements)
        saved = []
        for q in quotes:
            record = {
                "quote_id": str(uuid.uuid4()),
                "project_id": req.project_id,
                "vendor_name": q.get("vendor_name"),
                "amount": q.get("amount"),
                "details": q.get("details"),
                "contact_email": q.get("contact_email"),
                "status": "received",
                "created_at": datetime.datetime.now().isoformat()
            }
            supabase.table("quotations").insert(record).execute()
            saved.append(record)
        return {"status": "success", "quotes": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dispatch/assign")
async def assign_dispatch(req: DispatchRequest):
    try:
        res = supabase.table("field_agents").select("*").eq("name", "Raju (Field)").execute()
        if not res.data:
            raju = {"agent_id": "mock-agent-1", "name": "Raju (Field)", "location_lat": 18.5204, "location_lng": 73.8567, "is_available": True}
            # mock-agent-1 must exist in users table first. For MVP, we'll assume it exists or disable RLS constraint.
            # Using raw data payload to avoid foreign key constraints for MVP if needed:
            supabase.table("field_agents").insert(raju).execute()
        else:
            raju = res.data[0]
            raju["agent_id"] = "mock-agent-1" # override for MVP predictability

        saved_tasks = []
        for task in req.tasks:
            record = {
                "task_id": str(uuid.uuid4()),
                "project_id": req.project_id,
                "agent_id": "mock-agent-1",
                "task_desc": task["task_desc"],
                "target_location_lat": task["target_lat"],
                "target_location_lng": task["target_lng"],
                "status": "assigned",
                "created_at": datetime.datetime.now().isoformat()
            }
            # Add agent_name temporarily for frontend compatibility
            record_frontend = record.copy()
            record_frontend["agent_name"] = "Raju (Field)"
            
            supabase.table("field_tasks").insert(record).execute()
            saved_tasks.append(record_frontend)
            
        return {"status": "success", "assignments": saved_tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/field_tasks")
async def get_all_tasks():
    res = supabase.table("field_tasks").select("*, field_agents(name)").execute()
    tasks = res.data
    # Map agent name for frontend
    for t in tasks:
        t["agent_name"] = t.get("field_agents", {}).get("name", "Raju (Field)")
    return {"status": "success", "tasks": tasks}

@router.get("/field_tasks/{agent_id}")
async def get_agent_tasks(agent_id: str):
    res = supabase.table("field_tasks").select("*").eq("agent_id", agent_id).execute()
    return {"status": "success", "tasks": res.data}

class TaskComplete(BaseModel):
    task_id: str
    notes: str
    lat: float
    lng: float

@router.post("/field_tasks/complete_endpoint")
async def complete_task(req: TaskComplete):
    update_data = {
        "status": "pending_pm_approval",
        "completion_notes": req.notes,
        "completed_lat": req.lat,
        "completed_lng": req.lng,
        "photo_url": "https://images.unsplash.com/photo-1593113544331-561b36ad511b?q=80&w=400&auto=format&fit=crop",
        "completed_at": datetime.datetime.now().isoformat()
    }
    supabase.table("field_tasks").update(update_data).eq("task_id", req.task_id).execute()
    return {"status": "success"}

class TaskReview(BaseModel):
    task_id: str
    action: str

@router.post("/field_tasks/review")
async def review_task(req: TaskReview):
    if req.action == "approve":
        supabase.table("field_tasks").update({"status": "completed"}).eq("task_id", req.task_id).execute()
        
        # Free up agent
        task_res = supabase.table("field_tasks").select("*").eq("task_id", req.task_id).execute()
        if task_res.data:
            task = task_res.data[0]
            supabase.table("field_agents").update({
                "is_available": True,
                "location_lat": task.get("completed_lat"),
                "location_lng": task.get("completed_lng")
            }).eq("agent_id", task["agent_id"]).execute()
            
    elif req.action == "reject":
        supabase.table("field_tasks").update({
            "status": "assigned",
            "completion_notes": "",
            "photo_url": ""
        }).eq("task_id", req.task_id).execute()
        
    return {"status": "success"}

class ProcureSuggestRequest(BaseModel):
    charter_content: Dict[str, Any]

@router.post("/procurement/suggest")
async def suggest_procurement(req: ProcureSuggestRequest):
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are a Procurement Assistant. Read the following approved Project Charter:
    {json.dumps(req.charter_content)}
    
    List the exact products, materials, or services that need to be procured to fulfill this project.
    Output only the list of requirements in plain text, suitable for pasting into a quotation request form.
    """
    try:
        response = model.generate_content(prompt)
        return {"status": "success", "suggestions": response.text.strip()}
    except Exception as e:
        return {"status": "error", "suggestions": "Could not auto-suggest. Please enter manually."}

@router.get("/field_agents")
async def get_agents():
    res = supabase.table("field_agents").select("*").execute()
    agents = res.data
    # Frontend expects lat/lng
    for a in agents:
        a["lat"] = a.get("location_lat")
        a["lng"] = a.get("location_lng")
    return {"status": "success", "agents": agents}
