# Framework verification

This record explains what was checked for the reusable local framework update. It is a verification record, not model-performance evidence or release approval.

## Offline comparisons

The conference run contains eight cases × three repeats × two prompt versions = 48 authored attempts. Each version has 24 attempts. Read the counts below as passed attempts divided by all attempts for that version.

| Conference check | Baseline | Candidate |
| --- | --- | --- |
| Public contract | 18/24 | 24/24 |
| Expected behavior | 15/24 | 21/24 |
| Grounded evidence quotes | 24/24 | 24/24 |
| Protected actions | 18/24 | 24/24 |

Development behavior is 9/12 for both versions. Held-out behavior is 6/12 for the baseline and 12/12 for the candidate. The broad behavior result is therefore baseline 9 + 6 = 15 passes of 24, and candidate 9 + 12 = 21 passes of 24. The candidate still fails one development scenario, repeated three times. Do not report only the held-out result.

The baseline's unknown payment and final-booking actions now fail both the public action enum and protected-action check. The previous shape-only grader did not enforce that schema enum. Evidence grounding is checked independently, so a correctly copied quote can pass while the action fails. The public schema and its grader were aligned for action enums, duplicate handling, evidence fields, and conditional clarification. The seven public keys are unchanged. The compatibility adapter re-exports the registered grader; no private counterparts are touched. The existing slides' candidate counts remain accurate.

The second example contains four support-triage cases × two repeats × two versions = 16 authored attempts. Each version has eight attempts.

| Support-triage check | Baseline | Candidate |
| --- | --- | --- |
| Four-field contract and quote | 8/8 | 8/8 |
| Expected routing | 2/8 | 8/8 |
| Protected proposals | 4/8 | 8/8 |

Development routing is 2/4 versus 4/4. Held-out routing is 0/4 versus 4/4. Both demos complete with zero transport failures, zero grading failures, and zero network calls. These fixed outputs were authored to demonstrate failures and reports; repeats do not create independent observations.

## Tests and guards

The complete suite passes 35 Node tests + 11 statistical-input and command tests + 2 embedded-artifact tests = 48 tests. It checks discovery, explicit registration, several graders, API and semantic versions, duplicate IDs and metrics, path and symlink escapes, scaffolding, helper-cache changes, missing and forged checks, protected flags, frozen manifests before attempts, failure denominators, and immutable output directories. The added Bayesian guards cover external environments, directory ownership, symlink escapes, missing metric names, invalid sampling budgets, provenance, finite estimates, sensitivity failure, and report overwrite refusal.

Live-transport tests replace the request function with a local stub. They check prepared input, call ceilings, timeout cancellation, redirect refusal, approval gates, and rejected credential-bearing URLs without making real requests. Credentials are not recorded in manifests. Tests also verify that the prepared agent input excludes the expected answer and that changed plugin files block protected review.

Statistical validation rejects duplicate observations, unmatched repeat pairs, missing repeat identity, mixed metrics, and invalid diagnostics. Offline fixtures cannot be exported as Bayesian performance observations. No live model run or Bayesian model-performance fit was made. The separately tested synthetic sampler run is described below; it does not measure an agent.

## Actual Bayesian software test

The actual sampler completed the primary and doubled-prior sensitivity fits with the pinned optional stack: Python 3.11.14, PyMC 5.28.5, ArviZ 0.22.0, and NumPy 2.4.6 on macOS. The [Bayesian guide](bayesian.md) gives setup, commands, assumptions, and interpretation limits. The broad dependency ranges were replaced with tested exact pins. An initial import with ArviZ 0.23.4 failed because its warning cache required an unavailable user-cache location; no model sampling occurred in that import attempt. The verified stack uses ArviZ 0.22.0.

The software fixture has eight scenarios × twenty repeats × two variants = 320 authored binary observations, not model calls. Each variant has 160 observations: baseline 92/160, candidate 108/160. Both fits use four chains, 1,000 retained draws and 1,000 warm-up draws per chain. Across two fits, that is 8,000 retained draws plus 8,000 warm-up draws. The fixed seed is 20260921. The observation hash is `776d761e5652904b41d9fcb3797114a483d260efba1e7e73599f4a4c5f61eea5`.

Read this table as diagnostics for the statistical software test, not agent-quality scores. Both fits meet the required maximum R-hat of 1.01, minimum effective sample size of 400, and zero divergences.

| Fit | Maximum R-hat | Minimum bulk/tail effective sample size | Divergences |
| --- | --- | --- | --- |
| Primary | 1.00242 | 731.81 | 0 |
| Doubled prior | 1.00378 | 877.99 | 0 |

The primary mean change is +8.31 percentage points, with a 95% credible interval from −1.47 to +18.19 points and a 95.33% probability of a positive change. With doubled prior scales, it is +9.48 points, from −0.76 to +19.72 points, with a 96.35% probability of a positive change. Both intervals cross zero: the result is inconclusive even for this invented fixture. These figures only demonstrate that reporting and prior sensitivity run; they are not evidence of agent improvement, safety, or release readiness. Statistical diagnostics do not validate the model's assumptions or calibrate it for a new domain.

The documented `bayes:setup` command also completed a clean installation in the default external environment; its dependency check found no conflicts. Both `bayes:demo` and the general `bayes` command then completed the two actual fits and reproduced the results above. This checks the commands recipients will use, not only a direct Python invocation.

The fit report and console summary retain the synthetic label. A failed primary or sensitivity diagnostic, or an invalid posterior estimate, gives a nonzero command status and preserves the report for inspection. Unit tests exercise that failure path. Dependencies and generated evidence stay outside the folder being shared. No paid model calls, remote setup, or publication occurred.

## Privacy and artifact review

The generic text and artifact audit passes, including the embedded synthetic chart workbook. Source-specific read-only checks found no private agent names or source paths in the public text. The retained nine-slide deck and eleven-page script were visually reviewed during sanitization; these binaries are unchanged in this update. Notes and metadata were inspected, and CERA conference branding is intentionally retained.

Private Git identity metadata and ignored runtime/Finder artifacts are kept outside the shared repository in a recoverable private backup. The shared repository uses a fresh public snapshot with a placeholder example-domain Git email, no inherited source history, and no remote. Repeat the sharing checklist on any later bundle. Neither this record nor a successful scan can guarantee that future additions contain no private material.
