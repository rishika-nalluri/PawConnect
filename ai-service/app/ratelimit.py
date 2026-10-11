"""Per-user daily request limit. In-memory: resets on restart and is per instance."""
from __future__ import annotations

import datetime
import threading
from typing import Callable


class DailyLimiter:
    def __init__(
        self,
        limit: int,
        today: Callable[[], datetime.date] = datetime.date.today,
    ) -> None:
        self.limit = limit
        self._today = today
        self._counts: dict[tuple[str, datetime.date], int] = {}
        self._lock = threading.Lock()

    def allow(self, user_id: str) -> bool:
        day = self._today()
        with self._lock:
            for key in [k for k in self._counts if k[1] != day]:
                del self._counts[key]
            used = self._counts.get((user_id, day), 0)
            if used >= self.limit:
                return False
            self._counts[(user_id, day)] = used + 1
            return True
