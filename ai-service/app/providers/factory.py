from __future__ import annotations

from ..config import Settings
from .anthropic_provider import AnthropicProvider
from .base import AIProvider
from .groq import GroqProvider
from .openai_provider import OpenAIProvider


def build_provider(s: Settings) -> AIProvider | None:
    """Return the configured provider, or None so the service falls back to templates."""
    if s.ai_provider == "groq" and s.groq_api_key:
        return GroqProvider(s.groq_api_key, s.groq_model)
    if s.ai_provider == "openai" and s.openai_api_key:
        return OpenAIProvider(s.openai_api_key, s.openai_model)
    if s.ai_provider == "anthropic" and s.anthropic_api_key:
        return AnthropicProvider(s.anthropic_api_key, s.anthropic_model)
    return None
