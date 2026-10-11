import unittest

from app.explain import DISCLAIMER, passes_safety_check, template_explanation
from app.guard import OK, REDIRECT, URGENT, classify_message
from app.risk import CONSULT_VET, LOW, MODERATE, RiskInput, screen


def result_for(**overrides):
    base = dict(
        appetite="NORMAL", stool_consistency="NORMAL", vomiting_episodes=0,
        lethargy="NORMAL", water_intake="NORMAL",
    )
    base.update(overrides)
    return screen(RiskInput(**base))


class ExplainTests(unittest.TestCase):
    def test_consult_template_refers_to_vet_and_carries_disclaimer(self):
        text = template_explanation(result_for(stool_consistency="BLOOD_TINGED"))
        self.assertIn("veterinarian", text.lower())
        self.assertIn(DISCLAIMER, text)

    def test_low_template_offers_comfort_care_but_not_medication(self):
        text = template_explanation(result_for())
        self.assertIn("bland meal", text)
        self.assertNotIn("mg", text)

    def test_safety_check_rejects_diagnosis(self):
        self.assertFalse(passes_safety_check("Your dog is suffering from parvovirus.", LOW))

    def test_safety_check_rejects_dosing(self):
        self.assertFalse(passes_safety_check("Give 5 mg/kg twice a day.", LOW))

    def test_safety_check_allows_the_disclaimer_wording(self):
        self.assertTrue(passes_safety_check("Keep watching. This is not a diagnosis.", LOW))

    def test_safety_check_requires_vet_referral_when_needed(self):
        self.assertFalse(passes_safety_check("Keep an eye on the dog.", MODERATE))
        self.assertTrue(passes_safety_check("Please contact a veterinarian soon.", CONSULT_VET))

    def test_safety_check_rejects_empty_and_oversized(self):
        self.assertFalse(passes_safety_check("", LOW))
        self.assertFalse(passes_safety_check("x" * 1201, LOW))


class GuardTests(unittest.TestCase):
    def test_emergencies_are_urgent(self):
        self.assertEqual(classify_message("My dog ate chocolate an hour ago"), URGENT)
        self.assertEqual(classify_message("He collapsed and is not breathing"), URGENT)

    def test_diagnosis_and_dose_requests_are_redirected(self):
        self.assertEqual(classify_message("Can you diagnose my dog's cough?"), REDIRECT)
        self.assertEqual(classify_message("What dose of paracetamol should I give?"), REDIRECT)

    def test_ordinary_care_questions_pass(self):
        self.assertEqual(classify_message("How often should I brush my dog's teeth?"), OK)


if __name__ == "__main__":
    unittest.main()
