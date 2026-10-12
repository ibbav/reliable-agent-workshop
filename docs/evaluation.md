# Evaluation and uncertainty

This page answers one question: what may we honestly conclude from a comparison?

Freeze the prompts, cases, grader, model settings, and attempt budget before execution. Compare both prompt versions on the same scenarios and repeats. Count call failures, invalid JSON, and ungraded outputs as attempted observations.

Fit each binary metric separately. The supplied hierarchical logistic model gives each scenario its own baseline and a shrinking candidate effect, so three repeats of one scenario are not treated as three unrelated customers. Interpret the posterior only when the primary and doubled-prior fits meet all diagnostics: maximum R-hat at most 1.01, minimum bulk and tail effective sample size at least 400, and zero divergences.

Report raw counts, candidate minus baseline change, a 95% credible interval, the probability that the candidate is better, sensitivity results, and limitations. An interval crossing zero is inconclusive. A favorable posterior never overrides a protected-rule failure.

The runner also reports each development and held-out split and matched-pair outcomes. Its protected result is false when a candidate attempt cannot be transported or graded. A malformed grader cannot silently omit a metric or soften its declared veto. An output can satisfy the JSON contract and still fail correctness; these remain distinct measures.

Each live observation needs a unique scenario, repeat identifier, and variant. Both variants must have the same repeats per scenario. The statistical tool rejects duplicates, missing repeat identifiers, unmatched pairs, and mixed metrics. Finite diagnostics are required; missing values are not ignored. The model gives each scenario equal weight in the estimated average change, so the scenario set must represent the intended task. Repeats can remain correlated beyond the modeled structure; more repeated calls do not fix poor scenario coverage.

The public held-out cases are visible teaching material, not a protected unseen set. No live model calls or Bayesian performance fits were made for this framework update. The actual sampler has been tested separately with explicitly authored software-test data, including the doubled-prior fit. See the [Bayesian setup and interpretation guide](bayesian.md). Neither that test nor passing diagnostics certifies the statistical model for every future domain.

The deck's `17 of 20` versus `18 of 20` illustration uses simple Beta distributions to teach uncertainty. Those counts are invented for teaching. It is not the workshop replay result, a model-performance estimate, or a safety probability. The fixed replay cannot be exported for posterior performance analysis.
