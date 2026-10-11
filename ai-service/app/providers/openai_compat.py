"""Shared client for OpenAI-compatible chat endpoints (Groq and OpenAI both use this shape)."""
from __future__ import annotations

import httpx

from .base import AIProvider, ProviderError


class OpenAICompatibleProvider(AIProvider):
    def __init__(self, name: str, url: str, api_key: str, model: str, timeout: float = 15.0) -> None:
        self.name = name
        self.model = model
        self._url = url
        self._api_key = api_key
        self._timeout = timeout

    async def complete(self, system: str, user: str, max_tokens: int = 300) -> str:
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.post(
                    self._url,
                    json=payload,
                    headers={"Authorization": f"Bearer {self._api_key}"},
                )
        except httpx.HTTPError as exc:
            raise ProviderError(f"{self.name} request failed") from exc
        if resp.status_code != 200:
            raise ProviderError(f"{self.name} returned HTTP {resp.status_code}")
        try:
            return resp.json()["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise ProviderError(f"Unexpected {self.name} response") from exc
