import asyncio
import datetime
import unittest

from app.cache import TTLCache
from app.providers.base import AIProvider, ProviderError
from app.ratelimit import DailyLimiter
from app.risk import RiskInput
from app import service


class FakeClock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


class CacheTests(unittest.TestCase):
    def test_entries_expire(self):
        clock = FakeClock()
        cache = TTLCache(ttl_seconds=10, clock=clock)
        cache.set("k", "v")
        self.assertEqual(cache.get("k"), "v")
        clock.now = 10
        self.assertIsNone(cache.get("k"))

    def test_oldest_entry_evicted_when_full(self):
        clock = FakeClock()
        cache = TTLCache(ttl_seconds=100, max_items=2, clock=clock)
        cache.set("a", 1)
        clock.now = 1
        cache.set("b", 2)
        clock.now = 2
        cache.set("c", 3)
        self.assertIsNone(cache.get("a"))
        self.assertEqual(cache.get("c"), 3)


class LimiterTests(unittest.TestCase):
    def test_limit_then_reset_next_day(self):
        day = [datetime.date(2026, 10, 9)]
        limiter = DailyLimiter(limit=2, today=lambda: day[0])
        self.assertTrue(limiter.allow("u1"))
        self.assertTrue(limiter.allow("u1"))
        self.assertFalse(limiter.allow("u1"))
        self.assertTrue(limiter.allow("u2"))
        day[0] = datetime.date(2026, 10, 10)
        self.assertTrue(limiter.allow("u1"))


class FakeProvider(AIProvider):
    name = "fake"
    model = "fake-1"

    def __init__(self, reply=None, error=False):
        self._reply = reply
        self._error = error
        self.calls = 0

    async def complete(self, system, user, max_tokens=300):
        self.calls += 1
        if self._error:
            raise ProviderError("boom")
        return self._reply


class ServiceTests(unittest.TestCase):
    def setUp(self):
        service.RISK_CACHE._data.clear()

    def run_async(self, coro):
        return asyncio.run(coro)

    def test_template_used_without_provider(self):
        inp = RiskInput("NORMAL", "NORMAL", 0, "NORMAL", "NORMAL")
        out = self.run_async(service.assess(inp, None))
        self.assertEqual(out["model_provider"], "template")
        self.assertEqual(out["risk_level"], "LOW")

    def test_safe_model_text_is_used(self):
        provider = FakeProvider(reply="Keep watching and log any change. Not a diagnosis.")
        inp = RiskInput("NORMAL", "NORMAL", 0, "NORMAL", "NORMAL")
        out = self.run_async(service.assess(inp, provider))
        self.assertEqual(out["model_provider"], "fake")
        self.assertIn("Keep watching", out["explanation"])

    def test_unsafe_model_text_falls_back_to_template(self):
        provider = FakeProvider(reply="Your dog has parvovirus. Give 10 mg/kg.")
        inp = RiskInput("NONE", "NORMAL", 0, "NORMAL", "NORMAL")
        out = self.run_async(service.assess(inp, provider))
        self.assertEqual(out["model_provider"], "template")
        self.assertNotIn("parvovirus", out["explanation"])

    def test_provider_failure_falls_back_and_is_not_cached(self):
        inp = RiskInput("REDUCED", "NORMAL", 0, "NORMAL", "NORMAL")
        failing = FakeProvider(error=True)
        out = self.run_async(service.assess(inp, failing))
        self.assertEqual(out["model_provider"], "template")
        working = FakeProvider(reply="Please contact a veterinarian if this continues.")
        out2 = self.run_async(service.assess(inp, working))
        self.assertEqual(working.calls, 1)
        self.assertEqual(out2["model_provider"], "fake")

    def test_successful_result_is_cached(self):
        inp = RiskInput("NORMAL", "SOFT", 0, "NORMAL", "NORMAL")
        provider = FakeProvider(reply="Keep watching and log any change.")
        self.run_async(service.assess(inp, provider))
        self.run_async(service.assess(inp, provider))
        self.assertEqual(provider.calls, 1)

    def test_urgent_chat_never_calls_model(self):
        provider = FakeProvider(reply="should not be used")
        reply, guard = self.run_async(service.chat_reply("he is not breathing", None, provider))
        self.assertEqual(guard, "URGENT")
        self.assertEqual(provider.calls, 0)


if __name__ == "__main__":
    unittest.main()
