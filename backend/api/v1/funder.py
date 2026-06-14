from fastapi import APIRouter
from core.config import settings
from supabase import create_client, Client

router = APIRouter()

@router.get("/dashboard-metrics")
async def get_dashboard_metrics():
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    try:
        # Sum all debits from ledger
        ledger_res = supabase.table('financial_ledger').select('amount').eq('event_type', 'debit').execute()
        total_disbursed = sum(item['amount'] for item in ledger_res.data) if ledger_res.data else 0
        
        # Get total budget
        projects_res = supabase.table('projects').select('total_budget').execute()
        total_budget = sum(item['total_budget'] for item in projects_res.data) if projects_res.data else 500000
        
        return {
            "status": "success",
            "total_deployed": total_budget,
            "verified_disbursed": total_disbursed,
            "utilization_percentage": (total_disbursed / total_budget * 100) if total_budget > 0 else 0
        }
    except Exception as e:
        print(f"Error fetching metrics: {e}")
        return {
            "status": "error",
            "total_deployed": 500000,
            "verified_disbursed": 50000,
            "utilization_percentage": 10
        }

@router.get("/impact-logs")
async def get_impact_logs():
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    try:
        res = supabase.table('impact_logs').select('*').order('created_at', desc=True).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return {"status": "error", "data": []}
