import asyncio
import base64
from services.finance_agent import FinanceAgent

async def test():
    agent = FinanceAgent()
    img = base64.b64decode(b'/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=')
    res = await agent.scan_receipt('test.jpg', img)
    print(res)

asyncio.run(test())
