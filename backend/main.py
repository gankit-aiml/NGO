from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from api.v1 import whatsapp, finance, funder, agent, project_manager
from core.exceptions import global_exception_handler

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="NGO Co-Pilot MVP",
    description="Backend API for CSR Trust Oracle",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(Exception, global_exception_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include routers
app.include_router(whatsapp.router, prefix="/api/v1/webhook", tags=["WhatsApp"])
app.include_router(finance.router, prefix="/api/v1/finance", tags=["finance"])
app.include_router(funder.router, prefix="/api/v1/funder", tags=["funder"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["agent"])
app.include_router(project_manager.router, prefix="/api/v1/pm", tags=["project_manager"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
