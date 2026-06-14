from fastapi import APIRouter, UploadFile, File
from services.finance_agent import FinanceAgent
from repository.ledger_repo import LedgerRepo
from schemas.request_models import OCRReceiptData
import os
import uuid
import datetime

router = APIRouter()
finance_agent = FinanceAgent()
ledger_repo = LedgerRepo()

PROOFS_DIR = "../proofs"
os.makedirs(PROOFS_DIR, exist_ok=True)

@router.post("/upload-receipt")
async def upload_receipt(file: UploadFile = File(...)):
    file_bytes = await file.read()
    
    # Save file locally
    image_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(PROOFS_DIR, image_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
    
    receipt_url = f"http://127.0.0.1:8000/proofs/{image_filename}"
    
    # Get OCRResponse object
    ocr_response = await finance_agent.scan_receipt(file.filename, file_bytes, mime_type=file.content_type)
    
    # Flatten and map to frontend expectations
    return {
        "vendor_name": ocr_response.data.vendor_name,
        "tax_id": ocr_response.data.gstin,
        "total_amount": ocr_response.data.total_amount,
        "receipt_url": receipt_url
    }

@router.post("/approve-po")
async def approve_purchase_order(data: dict):
    # Expects dictionary due to dynamic receipt_url addition in frontend
    # Hardcoded project_id and user_id for MVP demo
    record = ledger_repo.append_ledger_entry(
        project_id="d1d88ca6-d5ee-4f4c-b3f5-de1e22699ff9",
        amount=data.get('total_amount', 0),
        approved_by="ffffffff-ffff-ffff-ffff-ffffffffffff",
        event_type="debit",
        receipt_storage_url=data.get('receipt_url')
    )
    return {"status": "success", "ledger_record": record}

@router.get("/ledger")
async def get_ledger():
    return {"status": "success", "data": ledger_repo.get_ledger()}

@router.get("/daily-cash")
async def get_daily_cash():
    return {"status": "success", "data": ledger_repo.get_daily_cash()}

@router.get("/audit-report")
async def get_audit_report():
    ledger = ledger_repo.get_ledger()
    total_receipts = sum(e['amount'] for e in ledger if e['event_type'] == 'credit')
    total_payments = sum(e['amount'] for e in ledger if e['event_type'] == 'debit')
    
    html_content = f"""
    <html>
    <head>
        <title>Form 10B / 10BB - Audit Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }}
            h1, h2, h3 {{ text-align: center; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #000; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .amount {{ text-align: right; }}
            .footer {{ margin-top: 50px; text-align: right; font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>FORM NO. 10B</h1>
        <h3>[See rule 17B]</h3>
        <h2>Audit report under section 12A(b) of the Income-tax Act, 1961</h2>
        <hr/>
        <p>We have examined the balance sheet of <b>NGO Co-Pilot Initiative</b> as at {datetime.datetime.now().strftime('%Y-%m-%d')} and the Income and Expenditure account for the year ended on that date which are in agreement with the books of account maintained by the said trust or institution.</p>
        
        <h3>Receipts and Payments Account</h3>
        <table>
            <tr>
                <th>Receipts</th>
                <th class="amount">Amount (INR)</th>
                <th>Payments</th>
                <th class="amount">Amount (INR)</th>
            </tr>
            <tr>
                <td>Grants Received (CSR)</td>
                <td class="amount">{total_receipts:,.2f}</td>
                <td>Program Expenses</td>
                <td class="amount">{total_payments:,.2f}</td>
            </tr>
            <tr>
                <td><b>Total</b></td>
                <td class="amount"><b>{total_receipts:,.2f}</b></td>
                <td><b>Total</b></td>
                <td class="amount"><b>{total_payments:,.2f}</b></td>
            </tr>
        </table>
        
        <p>In our opinion and to the best of our information, and according to information given to us, the said accounts give a true and fair view.</p>
        
        <div class="footer">
            <p>For AI Auditors & Co.</p>
            <p>Chartered Accountants</p>
            <p>Date: {datetime.datetime.now().strftime('%Y-%m-%d')}</p>
        </div>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)
