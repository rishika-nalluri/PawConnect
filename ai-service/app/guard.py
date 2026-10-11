"""Pre-filter for the pet-care assistant. Runs before any model call.

URGENT: the message may describe an emergency. Send the owner to an emergency clinic.
REDIRECT: the message asks for a diagnosis, a medication or a dose. Refuse and point to a vet.
OK: pass the message to the model.
"""
from __future__ import annotations

import re

URGENT = "URGENT"
REDIRECT = "REDIRECT"
OK = "OK"

_URGENT_PATTERNS = (
    r"\bnot breathing\b",
    r"\bcollaps",
    r"\bseizur",
    r"\bhaving a fit\b",
    r"\bbleeding (heavily|a lot|badly)\b",
    r"\bpoison",
    r"\bate (chocolate|grapes|raisins|xylitol|antifreeze|rat poison)",
    r"\bbloat",
    r"\bhit by a car\b",
    r"\bcan'?t (stand|walk)\b",
    r"\bunconscious\b",
)

_REDIRECT_PATTERNS = (
    r"\bdiagnos",
    r"\bwhat (disease|illness|condition|disorder) (does|do|is)\b",
    r"\bprescri",
    r"\bdosage\b",
    r"\bdose\b",
    r"\bhow many (mg|ml|tablets?)\b",
    r"\bis my dog (dying|going to die)\b",
    r"\bgive (him|her|my dog) (an? )?(antibiotic|painkiller|steroid)",
)

URGENT_REPLY = (
    "This may be an emergency. Please contact your nearest emergency veterinary clinic now. "
    "Do not wait for a reminder or an app response."
)
REDIRECT_REPLY = (
    "I can't diagnose conditions or recommend medication or doses. "
    "Please ask a veterinarian, and you can book one through PawConnect's vet connect."
)
UNAVAILABLE_REPLY = (
    "The pet-care assistant is unavailable right now. "
    "For questions about your dog's health, please book a veterinarian through PawConnect."
)


def classify_message(text: str) -> str:
    lowered = text.lower()
    if any(re.search(p, lowered) for p in _URGENT_PATTERNS):
        return URGENT
    if any(re.search(p, lowered) for p in _REDIRECT_PATTERNS):
        return REDIRECT
    return OK
