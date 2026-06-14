import uuid
import datetime
from core.config import settings
from supabase import create_client, Client

class LedgerRepo:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

    def append_ledger_entry(self, project_id: str, amount: float, approved_by: str, event_type: str = "debit", receipt_storage_url: str = None):
        """
        Appends an immutable record to the Supabase financial_ledger.
        """
        record = {
            "project_id": project_id,
            "event_type": event_type,
            "amount": amount,
            "approved_by_user_id": approved_by,
            "receipt_storage_url": receipt_storage_url,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        try:
            response = self.supabase.table('financial_ledger').insert(record).execute()
            print(f"LEDGER APPENDED: {response.data}")
            return response.data[0] if response.data else record
        except Exception as e:
            print(f"Failed to insert into ledger: {e}")
            return record

    def get_ledger(self):
        """Fetches all ledger entries"""
        response = self.supabase.table('financial_ledger').select('*').order('timestamp', desc=True).execute()
        return response.data if response.data else []
        
    def get_daily_cash(self):
        """Aggregates ledger by day"""
        entries = self.get_ledger()
        daily = {}
        for e in entries:
            date = e['timestamp'][:10]
            if date not in daily:
                daily[date] = {"date": date, "debits": 0, "credits": 0, "net": 0}
            if e['event_type'] == 'debit':
                daily[date]['debits'] += e['amount']
                daily[date]['net'] -= e['amount']
            else:
                daily[date]['credits'] += e['amount']
                daily[date]['net'] += e['amount']
        return list(daily.values())
