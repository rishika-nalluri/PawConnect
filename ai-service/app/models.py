from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Appetite = Literal["NORMAL", "REDUCED", "NONE", "INCREASED"]
Stool = Literal["NORMAL", "SOFT", "DIARRHOEA", "HARD", "BLOOD_TINGED"]
Lethargy = Literal["NORMAL", "MILD", "SEVERE"]
Water = Literal["NORMAL", "REDUCED", "INCREASED"]


class RiskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    appetite: Appetite
    stool_consistency: Stool
    vomiting_episodes: int = Field(ge=0, le=50)
    lethargy: Lethargy
    water_intake: Water
    weight_change_pct: float | None = Field(default=None, ge=-100, le=500)
    vaccines_overdue: bool = False
    has_vaccination_history: bool = False


class RiskResponse(BaseModel):
    risk_level: str
    confidence: float
    score: int
    reasons: list[str]
    red_flags: list[str]
    explanation: str
    model_provider: str
    model_version: str
    disclaimer: str


class DogContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(max_length=80)
    breed: str | None = Field(default=None, max_length=80)
    age_years: float | None = Field(default=None, ge=0, le=40)
    latest_risk_level: Literal["LOW", "MODERATE", "CONSULT_VET"] | None = None
    recent_symptoms: list[str] = Field(default_factory=list, max_length=10)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str = Field(min_length=1, max_length=64)
    message: str = Field(min_length=1, max_length=1000)
    dog_context: DogContext | None = None


class ChatResponse(BaseModel):
    reply: str
    guard: Literal["OK", "URGENT", "REDIRECT"]
    provider: str
