from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.pm_agents import CharterAgent, ProcurementAgent, DispatchAgent
from core.config import settings
import uuid
import json
import os
import datetime

router = APIRouter()
charter_agent = CharterAgent()
procurement_agent = ProcurementAgent()
dispatch_agent = DispatchAgent()

DB_DIR = "local_db"
os.makedirs(DB_DIR, exist_ok=True)

def load_db(filename, default=[]):
    filepath = os.path.join(DB_DIR, filename)
    if not os.path.exists(filepath):
        with open(filepath, "w") as f:
            json.dump(default, f)
        return default
    with open(filepath, "r") as f:
        return json.load(f)

def save_db(filename, data):
    filepath = os.path.join(DB_DIR, filename)
    with open(filepath, "w") as f:
        json.dump(data, f)

# Initialize mock field agents if empty
agents_db = load_db("agents.json", [])
if not agents_db:
    agents_db = [
        {"agent_id": str(uuid.uuid4()), "name": "Raju (Field)", "lat": 18.5204, "lng": 73.8567, "is_available": True},
        {"agent_id": str(uuid.uuid4()), "name": "Sham (Field)", "lat": 18.5314, "lng": 73.8446, "is_available": True},
        {"agent_id": str(uuid.uuid4()), "name": "Baburao (Field)", "lat": 18.5500, "lng": 73.8900, "is_available": True}
    ]
    save_db("agents.json", agents_db)


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
    tasks: List[Dict[str, Any]] # e.g. [{"task_desc": "Deliver 10 bags", "target_lat": 18.5, "target_lng": 73.8}]

@router.post("/charter/generate")
async def generate_charter(req: CharterRequest):
    try:
        charter = await charter_agent.generate_charter(req.core_elements)
        return {"status": "success", "charter": charter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/charter/submit")
async def submit_charter(req: CharterSubmit):
    charters = load_db("charters.json")
    record = {
        "charter_id": str(uuid.uuid4()),
        "project_id": req.project_id,
        "manager_id": req.manager_id,
        "content": req.content,
        "status": "pending_approval",
        "created_at": datetime.datetime.now().isoformat()
    }
    charters.append(record)
    save_db("charters.json", charters)
    return {"status": "success", "data": record}

@router.get("/charters")
async def get_charters():
    return {"status": "success", "data": load_db("charters.json")}

@router.post("/charter/approve")
async def approve_charter(charter_id: str):
    charters = load_db("charters.json")
    for c in charters:
        if c["charter_id"] == charter_id:
            c["status"] = "approved"
    save_db("charters.json", charters)
    return {"status": "success"}

@router.post("/procurement/start")
async def start_procurement(req: ProcurementRequest):
    try:
        quotes = await procurement_agent.fetch_quotations(req.requirements)
        db_quotes = load_db("quotations.json")
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
            db_quotes.append(record)
            saved.append(record)
        save_db("quotations.json", db_quotes)
        return {"status": "success", "quotes": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dispatch/assign")
async def assign_dispatch(req: DispatchRequest):
    try:
        agents = load_db("agents.json")
        
        # Ensure Raju exists as mock-agent-1
        raju = next((a for a in agents if a["name"].startswith("Raju")), None)
        if raju:
            raju["agent_id"] = "mock-agent-1"
        else:
            raju = {"agent_id": "mock-agent-1", "name": "Raju (Field)", "lat": 18.5204, "lng": 73.8567, "is_available": True}
            agents.append(raju)
            
        db_tasks = load_db("tasks.json")
        saved_tasks = []
        
        # For the MVP investor demo, assign EVERY task to Raju (mock-agent-1)
        for task in req.tasks:
            record = {
                "task_id": str(uuid.uuid4()),
                "project_id": req.project_id,
                "agent_id": "mock-agent-1",
                "agent_name": raju["name"],
                "task_desc": task["task_desc"],
                "target_location_lat": task["target_lat"],
                "target_location_lng": task["target_lng"],
                "status": "assigned",
                "created_at": datetime.datetime.now().isoformat()
            }
            db_tasks.append(record)
            saved_tasks.append(record)
            
        save_db("tasks.json", db_tasks)
        save_db("agents.json", agents) 
        
        return {"status": "success", "assignments": saved_tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/field_tasks")
async def get_all_tasks():
    return {"status": "success", "tasks": load_db("tasks.json")}

@router.get("/field_tasks/{agent_id}")
async def get_agent_tasks(agent_id: str):
    db_tasks = load_db("tasks.json")
    agent_tasks = [t for t in db_tasks if t.get("agent_id") == agent_id]
    return {"status": "success", "tasks": agent_tasks}

class TaskComplete(BaseModel):
    task_id: str
    notes: str
    lat: float
    lng: float

@router.post("/field_tasks/complete_endpoint")
async def complete_task(req: TaskComplete):
    db_tasks = load_db("tasks.json")
    for t in db_tasks:
        if t.get("task_id") == req.task_id:
            t["status"] = "pending_pm_approval"
            t["completion_notes"] = req.notes
            t["completed_lat"] = req.lat
            t["completed_lng"] = req.lng
            t["photo_url"] = "https://images.unsplash.com/photo-1593113544331-561b36ad511b?q=80&w=400&auto=format&fit=crop" # Mock photo for demo
            t["completed_at"] = datetime.datetime.now().isoformat()
            
    save_db("tasks.json", db_tasks)
    return {"status": "success"}

class TaskReview(BaseModel):
    task_id: str
    action: str # "approve" or "reject"

@router.post("/field_tasks/review")
async def review_task(req: TaskReview):
    db_tasks = load_db("tasks.json")
    for t in db_tasks:
        if t.get("task_id") == req.task_id:
            if req.action == "approve":
                t["status"] = "completed"
                # free up agent
                agents = load_db("agents.json")
                for a in agents:
                    if a["agent_id"] == t["agent_id"]:
                        a["is_available"] = True
                        a["lat"] = t.get("completed_lat", a["lat"])
                        a["lng"] = t.get("completed_lng", a["lng"])
                save_db("agents.json", agents)
            elif req.action == "reject":
                t["status"] = "assigned" # Back to agent
                t["completion_notes"] = ""
                t["photo_url"] = ""
                
    save_db("tasks.json", db_tasks)
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
    return {"status": "success", "agents": load_db("agents.json")}
