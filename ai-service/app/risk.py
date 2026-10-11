"""Rule-based symptom screening.

Pure Python, no network and no framework imports, so each rule can be read and tested directly.
The output is decision support: a tier, the reasons behind it, and any red flags.
It is not a diagnosis.

Scoring (points are added per input; the score sets the tier unless a red flag applies):
  appetite     NONE +3, REDUCED +1
  stool        BLOOD_TINGED +3 (red flag), DIARRHOEA +2, SOFT or HARD +1
  vomiting     3 or more +3, 1 to 2 +1
  lethargy     SEVERE +3 (red flag), MILD +1
  water        REDUCED +1, INCREASED +1
  weight       drop of 10% or more +3 (red flag), drop of 5% or more +2
  vaccines     any overdue +1 (advisory; it can only raise a LOW to a higher score)

Red flags force CONSULT_VET whatever the score is:
  blood in stool, severe lethargy, weight drop of 10% or more,
  repeated vomiting (3 or more) combined with any lethargy.

Tiers: score 0 to 2 LOW, 3 to 5 MODERATE, 6 or more CONSULT_VET.
"""
from __future__ import annotations

from dataclasses import dataclass

APPETITE_VALUES = frozenset({"NORMAL", "REDUCED", "NONE", "INCREASED"})
STOOL_VALUES = frozenset({"NORMAL", "SOFT", "DIARRHOEA", "HARD", "BLOOD_TINGED"})
LETHARGY_VALUES = frozenset({"NORMAL", "MILD", "SEVERE"})
WATER_VALUES = frozenset({"NORMAL", "REDUCED", "INCREASED"})

LOW = "LOW"
MODERATE = "MODERATE"
CONSULT_VET = "CONSULT_VET"

MODERATE_FROM_SCORE = 3
CONSULT_FROM_SCORE = 6


def _check(value: str, allowed: frozenset[str], field: str) -> None:
    if value not in allowed:
        raise ValueError(f"{field} must be one of {sorted(allowed)}")


@dataclass(frozen=True)
class RiskInput:
    appetite: str
    stool_consistency: str
    vomiting_episodes: int
    lethargy: str
    water_intake: str
    weight_change_pct: float | None = None
    vaccines_overdue: bool = False
    has_vaccination_history: bool = False

    def __post_init__(self) -> None:
        _check(self.appetite, APPETITE_VALUES, "appetite")
        _check(self.stool_consistency, STOOL_VALUES, "stool_consistency")
        _check(self.lethargy, LETHARGY_VALUES, "lethargy")
        _check(self.water_intake, WATER_VALUES, "water_intake")
        if not 0 <= self.vomiting_episodes <= 50:
            raise ValueError("vomiting_episodes must be between 0 and 50")
        if self.weight_change_pct is not None and not -100 <= self.weight_change_pct <= 500:
            raise ValueError("weight_change_pct is out of range")


@dataclass(frozen=True)
class RiskResult:
    tier: str
    score: int
    reasons: tuple[str, ...]
    red_flags: tuple[str, ...]
    confidence: float


def screen(x: RiskInput) -> RiskResult:
    score = 0
    reasons: list[str] = []
    flags: list[str] = []

    if x.appetite == "NONE":
        score += 3
        reasons.append("No appetite logged")
    elif x.appetite == "REDUCED":
        score += 1
        reasons.append("Appetite is reduced")

    if x.stool_consistency == "BLOOD_TINGED":
        score += 3
        reasons.append("Blood in the stool")
        flags.append("Blood in the stool")
    elif x.stool_consistency == "DIARRHOEA":
        score += 2
        reasons.append("Diarrhoea logged")
    elif x.stool_consistency in ("SOFT", "HARD"):
        score += 1
        reasons.append(f"Stool is {x.stool_consistency.lower()}")

    if x.vomiting_episodes >= 3:
        score += 3
        reasons.append("Vomiting 3 or more times")
    elif x.vomiting_episodes >= 1:
        score += 1
        reasons.append("Vomiting logged")

    if x.lethargy == "SEVERE":
        score += 3
        reasons.append("Severe lethargy")
        flags.append("Severe lethargy")
    elif x.lethargy == "MILD":
        score += 1
        reasons.append("Mild lethargy")

    if x.water_intake == "REDUCED":
        score += 1
        reasons.append("Drinking less water than usual")
    elif x.water_intake == "INCREASED":
        score += 1
        reasons.append("Drinking more water than usual")

    if x.weight_change_pct is not None:
        if x.weight_change_pct <= -10:
            score += 3
            reasons.append("Weight down 10% or more since the last log")
            flags.append("Weight down 10% or more")
        elif x.weight_change_pct <= -5:
            score += 2
            reasons.append("Weight down 5% or more since the last log")

    if x.vaccines_overdue:
        score += 1
        reasons.append("A vaccination is overdue")

    if x.vomiting_episodes >= 3 and x.lethargy != "NORMAL":
        flags.append("Repeated vomiting with lethargy")

    if not reasons:
        reasons.append("No concerning signs logged")

    unique_flags = tuple(dict.fromkeys(flags))

    if unique_flags or score >= CONSULT_FROM_SCORE:
        tier = CONSULT_VET
    elif score >= MODERATE_FROM_SCORE:
        tier = MODERATE
    else:
        tier = LOW

    # Confidence reflects how much data the screen had, not how accurate the rules are.
    confidence = 0.5
    if x.weight_change_pct is not None:
        confidence += 0.2
    if x.has_vaccination_history:
        confidence += 0.2

    return RiskResult(
        tier=tier,
        score=score,
        reasons=tuple(reasons),
        red_flags=unique_flags,
        confidence=round(confidence, 2),
    )
