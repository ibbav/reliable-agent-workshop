# What evidence justifies changing an agent?

This page answers one question: when does a candidate prompt have enough evidence to replace a baseline?

## One concrete comparison

The synthetic conference workshop replay has eight cases, three repeats, and two versions: 8 × 3 × 2 = 48 attempts. Each version gets 24 attempts. The fixture result illustrates how to report counts; it is authored teaching evidence, not observed live-model reliability. A candidate that passes 21 of 24 behavior attempts has 87.5% fixture success, but a protected-rule failure would still block release.

**Check:** State what the numbers are and are not before making a recommendation.

## Freeze before running

Freeze prompt hashes, cases, expected results, graders, model and tool settings, repeat count, and maximum calls. Use the same scenarios for both versions. Keep development cases separate from untouched held-out cases. Do not edit the grader after seeing candidate failures without restarting the comparison and recording why.

**Check:** A colleague can reproduce the comparison from a manifest and committed inputs.

## Match analysis to evidence

Report raw pass counts and paired outcomes first. Fit each binary metric separately; repeated attempts within one scenario are related, so a model that treats all attempts as independent can overstate certainty. Show the estimated candidate-minus-baseline change, its credible interval, probability of improvement, prior sensitivity, and convergence diagnostics. If the interval crosses zero, call the evidence inconclusive, not equivalent.

**Check:** The statistical summary reconciles with the raw attempts and does not pool unrelated metrics.

## A local improvement cycle

Pick one failure mode, propose the smallest prompt change, run a dry validation, then compare both versions on focused and broad cases. Preserve failures and negative results. Do not promote a candidate merely because its focused cases improved; verify that other behavior and protected rules held.

**Check:** The report includes focused, broad, and held-out results plus every model/API failure.

## Evidence that reaches a decision

The decision summary should say what changed, what passed, what failed, what remains uncertain, and what action is requested. A posterior is a decision aid, not a waiver for a forbidden booking or other protected-rule breach. Obtain explicit approval before paid calls or publication.

**Check:** A non-technical reviewer can tell whether this is an offline illustration, a live test, or a release decision.

## Further reading

The included offline replay and Bayesian analysis are local teaching implementations. Before adopting their statistical assumptions for another project, review the model, priors, grouping, and diagnostics with the responsible evaluator.
