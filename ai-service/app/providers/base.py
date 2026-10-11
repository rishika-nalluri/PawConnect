from __future__ import annotations

from abc import ABC, abstractmethod


class ProviderError(RuntimeError):
    """Raised when a model provider cannot produce a usable answer."""


class AIProvider(ABC):
    name: str
    model: str

    @abstractmethod
    async def complete(self, system: str, user: str, max_tokens: int = 300) -> str:
        ...
