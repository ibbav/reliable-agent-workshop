#!/usr/bin/env python3
"""Fit one binary metric with scenario-level partial pooling."""
import argparse, hashlib, json, math, os
import sys, platform
from pathlib import Path

os.environ.setdefault("MPLBACKEND", "Agg")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/reliable-agent-workshop-matplotlib")
os.environ.setdefault("PYTENSOR_FLAGS", "base_compiledir=/tmp/reliable-agent-workshop-pytensor")

def prepare(rows):
    if not rows:
        raise ValueError("empty observations")
    if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
        raise ValueError("observations must be a list of objects")
    if any(type(row.get("value")) not in (int, bool) or row["value"] not in (0, 1) for row in rows):
        raise ValueError("binary outcomes only")
    if any(not isinstance(row.get("metric"), str) or not row["metric"].strip() for row in rows):
        raise ValueError("metric must be a nonempty string")
    if len({row.get("metric") for row in rows}) != 1:
        raise ValueError("fit one metric at a time")
    if {row.get("variant") for row in rows} != {"a", "b"}:
        raise ValueError("variants must be a and b")
    seen = set()
    paired = {}
    for row in rows:
        if not isinstance(row.get("scenario_id"), str) or not row["scenario_id"]:
            raise ValueError("scenario_id must be a nonempty string")
        if type(row.get("repeat_id")) is not int or row["repeat_id"] < 1:
            raise ValueError("repeat_id must be a positive integer")
        key = (row["scenario_id"], row["repeat_id"], row["variant"])
        if key in seen:
            raise ValueError("Duplicate scenario, repeat_id, and variant")
        seen.add(key)
        paired.setdefault(key[:2], set()).add(row["variant"])
    if any(variants != {"a", "b"} for variants in paired.values()):
        raise ValueError("Every scenario and repeat_id must be paired")
    scenarios = sorted({row["scenario_id"] for row in rows})
    for scenario in scenarios:
        if {row["variant"] for row in rows if row["scenario_id"] == scenario} != {"a", "b"}:
            raise ValueError("both variants must cover every scenario")
    raw = {variant: {"passed": sum(row["value"] for row in rows if row["variant"] == variant), "total": sum(row["variant"] == variant for row in rows)} for variant in ("a", "b")}
    return scenarios, raw

def diagnostics_ok(rhat, ess, divergences):
    return isinstance(rhat, (int, float)) and isinstance(ess, (int, float)) and math.isfinite(rhat) and math.isfinite(ess) and rhat <= 1.01 and ess >= 400 and divergences == 0

def load_observations(source):
    if not isinstance(source, dict) or source.get("provenance") not in ("live_model", "synthetic_software_test"):
        raise ValueError("provenance must be live_model or synthetic_software_test; replay is not performance evidence")
    rows = source.get("observations")
    prepare(rows)
    return rows

def comparison_ok(report):
    def valid(result):
        diagnostic = result.get("diagnostics", {})
        if not diagnostics_ok(diagnostic.get("max_rhat"), diagnostic.get("min_bulk_tail_ess"), diagnostic.get("divergences")):
            return False
        numbers = [result.get("posterior_mean_delta"), result.get("p_delta_positive"), *result.get("ci95", [])]
        if len(numbers) != 4 or any(type(value) not in (int, float) or not math.isfinite(value) for value in numbers):
            return False
        mean, probability, low, high = numbers
        return -1 <= mean <= 1 and 0 <= probability <= 1 and -1 <= low <= high <= 1
    return valid(report) and valid(report.get("doubled_prior_sensitivity", {}))

def patch_macos_linker(compiler):
    if sys.platform != "darwin":
        return
    original = compiler.compile_args
    if "-ld64" not in original():
        return
    compiler.compile_args = staticmethod(lambda march_flags=True: [flag for flag in original(march_flags) if flag != "-ld64"])

def fit(rows, draws=1000, tune=1000, seed=20260921, prior_scale=1.0):
    for name, value in (("draws", draws), ("tune", tune)):
        if type(value) is not int or value < 1:
            raise ValueError(f"{name} must be a positive integer")
    if not isinstance(prior_scale, (int, float)) or not math.isfinite(prior_scale) or prior_scale <= 0:
        raise ValueError("prior_scale must be positive and finite")
    scenarios, raw = prepare(rows)
    import arviz as az
    import numpy as np
    import pymc as pm
    from pytensor.link.c.cmodule import GCC_compiler
    patch_macos_linker(GCC_compiler)
    index = np.array([scenarios.index(row["scenario_id"]) for row in rows])
    variant = np.array([int(row["variant"] == "b") for row in rows])
    outcome = np.array([row["value"] for row in rows])
    with pm.Model(coords={"scenario": scenarios}) as model:
        alpha = pm.Normal("alpha", 0, 1.5 * prior_scale)
        beta = pm.Normal("beta", 0, 0.5 * prior_scale)
        sigma_s = pm.HalfNormal("sigma_s", prior_scale)
        sigma_b = pm.HalfNormal("sigma_b", 0.5 * prior_scale)
        z_s = pm.Normal("z_s", 0, 1, dims="scenario")
        z_b = pm.Normal("z_b", 0, 1, dims="scenario")
        intercept = alpha + sigma_s * z_s
        effect = beta + sigma_b * z_b
        pm.Bernoulli("observed", logit_p=intercept[index] + effect[index] * variant, observed=outcome)
        p_a = pm.math.sigmoid(intercept)
        p_b = pm.math.sigmoid(intercept + effect)
        pm.Deterministic("delta", (p_b - p_a).mean())
        data = pm.sample(draws=draws, tune=tune, chains=4, cores=1, random_seed=seed, target_accept=0.99, progressbar=False)
    variables = ["alpha", "beta", "sigma_s", "sigma_b", "z_s", "z_b", "delta"]
    posterior = data.posterior if hasattr(data, "posterior") else data["posterior"]
    diagnostic_data = posterior.to_dataset() if hasattr(posterior, "to_dataset") else posterior
    rhats = az.rhat(diagnostic_data, var_names=variables).to_array().values.ravel()
    bulk = az.ess(diagnostic_data, var_names=variables, method="bulk").to_array().values.ravel()
    tail = az.ess(diagnostic_data, var_names=variables, method="tail").to_array().values.ravel()
    delta = np.asarray(data.posterior["delta"]).ravel()
    maximum_rhat = float(np.max(rhats)) if np.isfinite(rhats).all() else None
    all_ess = np.concatenate([bulk, tail])
    minimum_ess = float(np.min(all_ess)) if np.isfinite(all_ess).all() else 0.0
    divergences = int(np.asarray(data.sample_stats["diverging"]).sum())
    return {
        "metric": rows[0]["metric"], "raw": raw, "distinct_scenarios": len(scenarios),
        "model": "Bernoulli logistic with a shared scenario intercept and shrinking scenario-specific candidate effect",
        "prior_scale": prior_scale, "posterior_mean_delta": float(delta.mean()),
        "ci95": np.quantile(delta, [0.025, 0.975]).tolist(), "p_delta_positive": float((delta > 0).mean()),
        "diagnostics": {"max_rhat": maximum_rhat, "min_bulk_tail_ess": minimum_ess, "divergences": divergences, "chains": 4, "draws_per_chain": draws, "tune_per_chain": tune, "seed": seed},
        "diagnostics_ok": diagnostics_ok(maximum_rhat, minimum_ess, divergences),
        "runtime": {"python": platform.python_version(), "pymc": pm.__version__, "arviz": az.__version__, "numpy": np.__version__},
        "observations_sha256": hashlib.sha256(json.dumps(rows, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--out", required=True)
    parser.add_argument("--draws", type=int, default=1000)
    parser.add_argument("--tune", type=int, default=1000)
    args = parser.parse_args()
    if Path(args.out).exists():
        parser.error("output already exists; choose a new report path")
    source = json.loads(Path(args.input).read_text())
    rows = load_observations(source)
    primary = fit(rows, args.draws, args.tune)
    sensitivity = fit(rows, args.draws, args.tune, prior_scale=2.0)
    primary["doubled_prior_sensitivity"] = sensitivity
    primary["both_diagnostics_ok"] = comparison_ok(primary)
    primary["provenance"] = source["provenance"]
    primary["interpretation"] = ("Software verification only; not model-performance evidence." if source["provenance"] == "synthetic_software_test" else "Diagnostic success is not release approval; review protected rules and the evaluation design.")
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with Path(args.out).open("x") as output:
        output.write(json.dumps(primary, indent=2) + "\n")
    print(json.dumps({key: primary[key] for key in ["provenance", "interpretation", "raw", "posterior_mean_delta", "ci95", "p_delta_positive", "both_diagnostics_ok", "diagnostics", "doubled_prior_sensitivity"]}, indent=2))
    if not primary["both_diagnostics_ok"]:
        raise SystemExit(2)

if __name__ == "__main__":
    main()
