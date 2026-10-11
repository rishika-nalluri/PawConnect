from __future__ import annotations

import httpx

from .base import AIProvider, ProviderError

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def __init__(self, api_key: str, model: str, timeout: float = 15.0) -> None:
        self.model = model
        self._api_key = api_key
        self._timeout = timeout

    async def complete(self, system: str, user: str, max_tokens: int = 300) -> str:
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
        headers = {"x-api-key": self._api_key, "anthropic-version": "2023-06-01"}
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.post(ANTHROPIC_URL, json=payload, headers=headers)
        except httpx.HTTPError as exc:
            raise ProviderError("anthropic request failed") from exc
        if resp.status_code != 200:
            raise ProviderError(f"anthropic returned HTTP {resp.status_code}")
        try:
            return resp.json()["content"][0]["text"]
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise ProviderError("Unexpected anthropic response") from exc
