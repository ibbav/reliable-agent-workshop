#!/usr/bin/env python3
"""Exercise the actual sampler with authored binary data, never model results."""
import argparse
import json
from pathlib import Path
from hierarchical_binary import comparison_ok, fit

def synthetic_observations():
    rows = []
    for scenario in range(8):
        for repeat in range(1, 21):
            for variant, passes in (("a", 8 + scenario), ("b", 10 + scenario)):
                rows.append({"metric":"synthetic_accuracy", "scenario_id":f"synthetic-{scenario + 1}",
                             "repeat_id":repeat, "variant":variant, "value":int(repeat <= passes)})
    return rows

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    folder = Path(args.output)
    folder.mkdir(parents=True, exist_ok=False)
    rows = synthetic_observations()
    fixture = {"provenance":"synthetic_software_test", "observations":rows,
               "sampling_plan":{"chains":4,"draws_per_chain":1000,"tune_per_chain":1000,"seed":20260921,"prior_scales":[1.0,2.0]}}
    (folder / "observations.json").write_text(json.dumps(fixture, indent=2) + "\n")
    report = fit(rows)
    report["doubled_prior_sensitivity"] = fit(rows, prior_scale=2.0)
    report["provenance"] = fixture["provenance"]
    report["interpretation"] = "Authored software test, not model-performance evidence or release approval."
    report["both_diagnostics_ok"] = comparison_ok(report)
    report["software_checks_ok"] = all(
        result["raw"] == {"a":{"passed":92,"total":160},"b":{"passed":108,"total":160}}
        and result["prior_scale"] == scale and result["distinct_scenarios"] == 8
        and all(result["diagnostics"][key] == value for key, value in
                {"chains":4,"draws_per_chain":1000,"tune_per_chain":1000,"seed":20260921}.items())
        for result, scale in ((report, 1.0), (report["doubled_prior_sensitivity"], 2.0)))
    (folder / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    if not report["both_diagnostics_ok"] or not report["software_checks_ok"]:
        raise SystemExit(2)

if __name__ == "__main__":
    main()
