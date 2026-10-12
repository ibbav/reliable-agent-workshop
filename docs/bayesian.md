# Running the Bayesian comparison

This page answers one question: how do I run the statistical analysis without mistaking a software demo for evidence that an agent improved?

The optional Bayesian workflow is implemented and tested with the actual sampler. It is separate from the normal offline demo. A Bayesian model expresses uncertainty under stated assumptions; it does not approve a release or make invented outputs into measured performance.

## Install once, outside the folder you share

Use Node.js 20 or later and Python 3.11 or 3.12. The verified environment uses Python 3.11. The pinned packages are in `evaluation/requirements-lock.txt`; update and re-test them deliberately rather than accepting a new major version automatically.

```bash
npm run bayes:setup -- --python python3.11
npm run bayes:demo
```

Setup downloads Python packages; it makes no model calls. It creates an isolated environment in your user cache, outside this repository, and does not change global Python packages. If the interpreter has another name, pass it with `--python`. You can choose another external location with `--env`; use the same option for later commands. Existing unrelated directories are refused. The demo prints the location of its fresh temporary report directory. Keep reports you need in a separate evidence folder.

This was verified on macOS with Python 3.11. Other platforms and Python 3.12 are supported by the setup guard but have not been independently exercised here. PyTensor may need a compatible C++ compiler; follow the [PyMC installation instructions](https://www.pymc.io/projects/docs/en/stable/installation.html) if compilation fails. Do not disable diagnostics to work around an installation error.

## What the software demo proves

The demo authors eight scenarios, with twenty repeats and two variants: eight × twenty × two = 320 binary observations. Each variant has eight × twenty = 160 observations. The baseline has 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 = 92 authored passes. The candidate has 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 = 108 authored passes. These are not model attempts.

Before sampling, the demo saves the data and sampling plan. It fits four chains with 1,000 retained draws and 1,000 warm-up draws each, then repeats with doubled prior scales. Four chains × 1,000 retained draws × two fits = 8,000 posterior draws, plus another 8,000 warm-up draws. Statistical draws are internal calculations, not paid API calls.

The demo checks the raw counts, finite posterior values, and diagnostics in both fits. A failing check gives a nonzero exit status and preserves the report. The synthetic label stays in the report. This checks installation and execution, not whether the statistical assumptions suit your business problem.

## Analyze an approved live comparison

First obtain approval for the live calls and their cost. Freeze the prompts, scenarios, repeats, grader, dependencies, and model settings. Use the runner's complete attempts file, including failed calls, and export one metric at a time:

```bash
node evaluation/export_observations.mjs --attempts ../evidence/live-run/attempts.json --metric behavior --output ../evidence/behavior.json
npm run bayes -- --input ../evidence/behavior.json --output ../evidence/behavior-fit.json
```

Replace the paths and metric with your actual run. The exporter accepts only attempts labeled `live_model`; fixed replay outputs are refused. The fit requires explicit provenance, a nonempty metric, binary outcomes, and a unique paired baseline/candidate observation for every scenario and repeat. Provenance labels prevent accidental mixing; they cannot detect deliberately mislabeled data. Reports use new paths and are never silently overwritten. The command requires generated reports to stay outside the shared repository.

The main fit and doubled-prior sensitivity fit must each have maximum R-hat at most 1.01, minimum bulk and tail effective sample size at least 400, and zero divergences. R-hat checks whether chains agree; effective sample size estimates the independent information in correlated draws; divergences warn that the sampler struggled. See the [ArviZ diagnostic reference](https://python.arviz.org/en/v0.22.0/api/diagnostics.html). A diagnostic failure returns a nonzero exit status even when the other fit passes. If a frozen sampling plan fails, retain and report that failure before defining a new plan.

## Read the result honestly

Report the raw counts, the estimated candidate-minus-baseline change, its 95% credible interval, the probability of a positive change, both diagnostic summaries, and prior sensitivity. A credible interval contains 95% of the posterior probability under this model and data. If it crosses zero, the comparison is inconclusive, not proof of equivalence.

The model shares information across scenarios while allowing different baseline rates and candidate effects. Its reported change gives each scenario equal weight. It models scenario-level dependence, not every possible dependence between paired repeats. Review scenario coverage, temporal effects, scoring errors, and other shared conditions before using it for a decision. Fit separate metrics separately; never average correctness and protected rules into one score. Diagnostic success does not establish calibration, adequate power, practical benefit, safety, or release approval. Protected-rule failures still veto release.
