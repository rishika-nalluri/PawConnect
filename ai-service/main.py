"""PawConnect AI service. Reachable only from the Spring Boot backend (private service on Render)."""
from __future__ import annotations

import hmac

from fastapi import Depends, FastAPI, Header, HTTPException

from app import service
from app.config import load_settings
from app.explain import DISCLAIMER
from app.models import ChatRequest, ChatResponse, RiskRequest, RiskResponse
from app.providers.factory import build_provider
from app.ratelimit import DailyLimiter
from app.risk import RiskInput

settings = load_settings()
provider = build_provider(settings)
limiter = DailyLimiter(settings.chat_daily_limit)

app = FastAPI(
    title="PawConnect AI service",
    version="0.3.0",
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None,
)


def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    # Fail closed: with no configured token, every protected call is refused.
    if not settings.internal_token:
        raise HTTPException(status_code=503, detail="AI service is not configured")
    if not x_internal_token or not hmac.compare_digest(x_internal_token, settings.internal_token):
        raise HTTPException(status_code=401, detail="Invalid internal token")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "provider": provider.name if provider else "template"}


@app.post("/risk", response_model=RiskResponse, dependencies=[Depends(require_internal_token)])
async def risk(req: RiskRequest) -> RiskResponse:
    result = await service.assess(RiskInput(**req.model_dump()), provider)
    return RiskResponse(**result, disclaimer=DISCLAIMER)


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(require_internal_token)])
async def chat(req: ChatRequest) -> ChatResponse:
    if not limiter.allow(req.user_id):
        raise HTTPException(status_code=429, detail="Daily chat limit reached. Try again tomorrow.")
    reply, guard = await service.chat_reply(req.message, req.dog_context, provider)
    return ChatResponse(reply=reply, guard=guard, provider=provider.name if provider else "template")
