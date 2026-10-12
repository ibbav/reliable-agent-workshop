import unittest
from hierarchical_binary import prepare, diagnostics_ok

class InputTests(unittest.TestCase):
    def rows(self):
        return [{"metric":"accuracy","scenario_id":"s1","case_id":"s1","repeat_id":r,"variant":v,"value":1} for r in (1,2) for v in ("a","b")]

    def test_requires_matched_repeats(self):
        rows=self.rows()[:-1]
        with self.assertRaisesRegex(ValueError,"paired"):
            prepare(rows)

    def test_rejects_duplicate_observations(self):
        rows=self.rows(); rows.append(dict(rows[0]))
        with self.assertRaisesRegex(ValueError,"Duplicate"):
            prepare(rows)

    def test_rejects_missing_repeat_identity(self):
        rows=self.rows(); del rows[0]["repeat_id"]
        with self.assertRaisesRegex(ValueError,"repeat_id"):
            prepare(rows)

    def test_keeps_metrics_separate(self):
        rows=self.rows(); rows[0]["metric"]="privacy"
        with self.assertRaisesRegex(ValueError,"one metric"):
            prepare(rows)

    def test_diagnostics_fail_closed(self):
        for r,e,d in [(None,500,0),(float("nan"),500,0),(1.02,500,0),(1.0,399,0),(1.0,500,1)]:
            self.assertFalse(diagnostics_ok(r,e,d))

if __name__ == "__main__":
    unittest.main()
