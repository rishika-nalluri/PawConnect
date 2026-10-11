import unittest

from app.risk import CONSULT_VET, LOW, MODERATE, RiskInput, screen


def make(**overrides) -> RiskInput:
    base = dict(
        appetite="NORMAL",
        stool_consistency="NORMAL",
        vomiting_episodes=0,
        lethargy="NORMAL",
        water_intake="NORMAL",
        weight_change_pct=None,
        vaccines_overdue=False,
        has_vaccination_history=False,
    )
    base.update(overrides)
    return RiskInput(**base)


class RiskTests(unittest.TestCase):
    def test_healthy_dog_is_low(self):
        r = screen(make())
        self.assertEqual(r.tier, LOW)
        self.assertEqual(r.score, 0)
        self.assertEqual(r.reasons, ("No concerning signs logged",))

    def test_blood_in_stool_is_red_flag_even_with_low_score(self):
        r = screen(make(stool_consistency="BLOOD_TINGED"))
        self.assertEqual(r.score, 3)
        self.assertEqual(r.tier, CONSULT_VET)
        self.assertIn("Blood in the stool", r.red_flags)

    def test_severe_lethargy_is_red_flag(self):
        r = screen(make(lethargy="SEVERE"))
        self.assertEqual(r.tier, CONSULT_VET)
        self.assertIn("Severe lethargy", r.red_flags)

    def test_repeated_vomiting_with_lethargy_is_red_flag(self):
        r = screen(make(vomiting_episodes=3, lethargy="MILD"))
        self.assertEqual(r.tier, CONSULT_VET)
        self.assertIn("Repeated vomiting with lethargy", r.red_flags)

    def test_repeated_vomiting_alone_is_moderate_not_flagged(self):
        r = screen(make(vomiting_episodes=3))
        self.assertEqual(r.score, 3)
        self.assertEqual(r.tier, MODERATE)
        self.assertEqual(r.red_flags, ())

    def test_several_mild_signs_reach_moderate(self):
        r = screen(make(appetite="REDUCED", water_intake="REDUCED", stool_consistency="SOFT"))
        self.assertEqual(r.score, 3)
        self.assertEqual(r.tier, MODERATE)
        self.assertEqual(r.red_flags, ())

    def test_score_of_six_is_consult_vet(self):
        r = screen(make(appetite="NONE", stool_consistency="DIARRHOEA", vomiting_episodes=1))
        self.assertEqual(r.score, 6)
        self.assertEqual(r.tier, CONSULT_VET)

    def test_weight_drop_ten_percent_is_red_flag(self):
        r = screen(make(weight_change_pct=-12.0))
        self.assertEqual(r.tier, CONSULT_VET)
        self.assertIn("Weight down 10% or more", r.red_flags)

    def test_weight_drop_five_percent_adds_points_only(self):
        r = screen(make(weight_change_pct=-6.0))
        self.assertEqual(r.score, 2)
        self.assertEqual(r.tier, LOW)
        self.assertTrue(any("5%" in reason for reason in r.reasons))

    def test_overdue_vaccine_alone_stays_low(self):
        r = screen(make(vaccines_overdue=True))
        self.assertEqual(r.score, 1)
        self.assertEqual(r.tier, LOW)
        self.assertIn("A vaccination is overdue", r.reasons)

    def test_confidence_reflects_data_completeness_not_accuracy(self):
        self.assertEqual(screen(make()).confidence, 0.5)
        self.assertEqual(screen(make(weight_change_pct=0.0)).confidence, 0.7)
        self.assertEqual(
            screen(make(weight_change_pct=0.0, has_vaccination_history=True)).confidence, 0.9
        )

    def test_unknown_enum_value_is_rejected(self):
        with self.assertRaises(ValueError):
            make(appetite="HUNGRY")

    def test_vomiting_out_of_range_is_rejected(self):
        with self.assertRaises(ValueError):
            make(vomiting_episodes=51)
        with self.assertRaises(ValueError):
            make(vomiting_episodes=-1)


if __name__ == "__main__":
    unittest.main()
