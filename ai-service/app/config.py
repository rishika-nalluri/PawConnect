"""Environment-driven settings. Secrets come from the environment, never from code."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    environment: str
    ai_provider: str
    groq_api_key: str
    groq_model: str
    openai_api_key: str
    openai_model: str
    anthropic_api_key: str
    anthropic_model: str
    internal_token: str
    chat_daily_limit: int


def load_settings(env: dict | os._Environ = os.environ) -> Settings:
    return Settings(
        environment=env.get("ENVIRONMENT", "development"),
        ai_provider=env.get("AI_PROVIDER", "groq").strip().lower(),
        groq_api_key=env.get("GROQ_API_KEY", ""),
        groq_model=env.get("AI_MODEL_GROQ", "llama-3.1-8b-instant"),
        openai_api_key=env.get("OPENAI_API_KEY", ""),
        openai_model=env.get("OPENAI_MODEL", "gpt-4o-mini"),
        anthropic_api_key=env.get("ANTHROPIC_API_KEY", ""),
        anthropic_model=env.get("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"),
        internal_token=env.get("AI_INTERNAL_TOKEN", ""),
        chat_daily_limit=int(env.get("CHAT_DAILY_LIMIT", "30")),
    )
