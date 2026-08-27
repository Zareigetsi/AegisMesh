"""
AegisMesh — Priority Score Unit Tests
Smart India Hackathon Prototype (PS 26206)

Tests the mathematical, explainable priority algorithm.
Run with: python3 -m unittest tests/test_priority.py
"""

import unittest

def calculate_priority_score(severity, people_affected, incident_type, people_trapped=0, status='Unverified'):
    """
    Explainable Priority Formula:
    Total = Severity Score (0-40)
          + People Affected Score (0-20)
          + Incident Type Score (0-25)
          + Trapped Escalation Score (0-15)
          + Verification Status Boost (+10)
    """
    # 1. Severity Score
    if severity == 'Critical':
        severity_score = 40
    elif severity == 'High':
        severity_score = 28
    elif severity == 'Medium':
        severity_score = 18
    else:
        severity_score = 8

    # 2. People Affected Score (max 20 points at 60+ people)
    people_score = min(20, round((max(1, people_affected) / 60) * 20))

    # 3. Incident Type Risk
    type_scores = {
        'Medical Emergency': 25,
        'People Trapped': 20,
        'Fire': 15,
        'Earthquake': 15,
        'Flood': 12,
        'Road Block': 10,
        'Building Damage': 10,
        'Other': 8
    }
    type_score = type_scores.get(incident_type, 10)

    # 4. Trapped Escalation Score
    trapped_score = min(15, round(people_trapped * 1.5))

    # 5. Verification Status Boost
    verification_score = 10 if status == 'Verified' else 0

    total = severity_score + people_score + type_score + trapped_score + verification_score
    return min(100, max(5, total))


class TestPriorityScoring(unittest.TestCase):

    def test_critical_flood_with_trapped_citizens(self):
        # Critical (40) + 43 people (14) + Flood (12) + 12 trapped (15 capped) + Verified (10) => High score ~91-94
        score = calculate_priority_score('Critical', 43, 'Flood', people_trapped=12, status='Verified')
        self.assertGreaterEqual(score, 90)
        self.assertLessEqual(score, 100)

    def test_low_severity_minor_overflow(self):
        # Low (8) + 10 people (3) + Flood (12) + 0 trapped + Unverified (0) => ~23
        score = calculate_priority_score('Low', 10, 'Flood', people_trapped=0, status='Unverified')
        self.assertLess(score, 35)

    def test_verification_boost(self):
        unverified = calculate_priority_score('High', 30, 'Fire', 0, 'Unverified')
        verified = calculate_priority_score('High', 30, 'Fire', 0, 'Verified')
        self.assertEqual(verified - unverified, 10)

if __name__ == '__main__':
    unittest.main()
