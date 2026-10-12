import json
import math
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
import hierarchical_binary as model

class PipelineTests(unittest.TestCase):
    def test_missing_metric_is_not_a_valid_single_metric(self):
        rows = [{"scenario_id":"s", "repeat_id":1, "variant":v, "value":1} for v in ("a","b")]
        with self.assertRaisesRegex(ValueError, "metric"):
            model.prepare(rows)

    def test_invalid_budget_rejects_before_optional_imports(self):
        rows = [{"metric":"accuracy", "scenario_id":"s", "repeat_id":1, "variant":v, "value":1} for v in ("a","b")]
        with self.assertRaisesRegex(ValueError, "draws"):
            model.fit(rows, draws=0)

    def test_unknown_or_replay_provenance_cannot_become_performance_evidence(self):
        for provenance in (None, "offline_fixture", "unknown"):
            with self.assertRaisesRegex(ValueError, "provenance"):
                model.load_observations({"provenance":provenance,"observations":[]})

    def test_both_fits_and_finite_posterior_are_required(self):
        fit = {"posterior_mean_delta":0.1,"ci95":[-0.1,0.3],"p_delta_positive":0.8,
               "diagnostics":{"max_rhat":1.001,"min_bulk_tail_ess":800,"divergences":0}}
        report = {**fit,"doubled_prior_sensitivity":dict(fit)}
        self.assertTrue(model.comparison_ok(report))
        for key,value in (("posterior_mean_delta",math.nan),("ci95",[0.4,-0.1]),("p_delta_positive",1.1)):
            bad={**report,key:value}
            self.assertFalse(model.comparison_ok(bad))
        bad={**report,"doubled_prior_sensitivity":{**fit,"diagnostics":{"max_rhat":1.02,"min_bulk_tail_ess":800,"divergences":0}}}
        self.assertFalse(model.comparison_ok(bad))

    def test_cli_rejects_overwrite_before_sampling(self):
        with tempfile.TemporaryDirectory() as folder:
            source=Path(folder)/"input.json"
            source.write_text(json.dumps({"provenance":"synthetic_software_test","observations":[]}))
            output=Path(folder)/"existing.json";output.write_text("preserve me")
            run=subprocess.run([sys.executable,"-B",str(Path(model.__file__)),str(source),"--out",str(output)],capture_output=True,text=True)
            self.assertNotEqual(run.returncode,0)
            self.assertIn("already exists",run.stderr)
            self.assertEqual(output.read_text(),"preserve me")

    def test_failed_sensitivity_keeps_report_and_exits_nonzero(self):
        good = {"raw":{"a":{"passed":1,"total":1},"b":{"passed":1,"total":1}},
                "posterior_mean_delta":0.0,"ci95":[-0.1,0.1],"p_delta_positive":0.5,
                "diagnostics":{"max_rhat":1.001,"min_bulk_tail_ess":800,"divergences":0},"diagnostics_ok":True}
        bad = {**good,"diagnostics":{"max_rhat":1.02,"min_bulk_tail_ess":800,"divergences":0},"diagnostics_ok":False}
        with tempfile.TemporaryDirectory() as folder:
            source=Path(folder)/"input.json";output=Path(folder)/"report.json"
            rows=[{"metric":"accuracy","scenario_id":"s","repeat_id":1,"variant":v,"value":1} for v in ("a","b")]
            source.write_text(json.dumps({"provenance":"synthetic_software_test","observations":rows}))
            with patch.object(sys,"argv",["fit",str(source),"--out",str(output)]), patch.object(model,"fit",side_effect=[good,bad]), patch("builtins.print"):
                with self.assertRaises(SystemExit) as result:
                    model.main()
            self.assertEqual(result.exception.code,2)
            self.assertFalse(json.loads(output.read_text())["both_diagnostics_ok"])

if __name__ == "__main__":
    unittest.main()
